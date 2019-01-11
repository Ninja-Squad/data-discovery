package fr.inra.urgi.datadiscovery.harvest;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.core.TreeNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.datadiscovery.config.DataDiscoveryProperties;
import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import fr.inra.urgi.datadiscovery.domain.Document;
import fr.inra.urgi.datadiscovery.domain.IndexedDocument;
import fr.inra.urgi.datadiscovery.harvest.HarvestResult.HarvestResultBuilder;
import fr.inra.urgi.datadiscovery.harvest.HarvestedFile.HarvestedFileBuilder;
import org.springframework.data.elasticsearch.ElasticsearchException;

/**
 * A harvester, which can load all the JSON files located in the resource directory, and then, for each of these
 * files, parse the array of documents it's supposed to contain, and insert them in Elastic Search
 *
 * To avoid aborting with an exception, and instead provide a useful diagnostic, this harvester records the errors
 * happening during the harvesting process into an {@link HarvestResult}, using its builder.
 *
 * Since the files can be large, instead of parsing the whole array, the streaming API of Jackson is used to
 * parse the document inside the array one by one. This allows being faster, and to consume much less memory.
 *
 * @author JB Nizet
 */
public abstract class AbstractHarvester<D extends Document, I extends IndexedDocument<D>> {

    private static final int BATCH_SIZE = 10000;

    private final Path resourceDir;
    private final ObjectMapper objectMapper;
    private final DocumentDao<D, I> documentDao;
//    private Path tempDir ;

    public AbstractHarvester(DataDiscoveryProperties dataDiscoveryProperties,
                                  ObjectMapper objectMapper,
                                  DocumentDao<D, I> documentDao) {
        this.resourceDir = dataDiscoveryProperties.getResourceDir();
        this.objectMapper = objectMapper;
        this.documentDao = documentDao;
//        try {
//            tempDir = Files.createTempDirectory(Paths.get("~/bulk_index/"),"indexed_documents_");
//            System.out.println("Storing files into: " + tempDir.toAbsolutePath().toString());
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
    }

    /**
     * Finds all the JSON files located inside the resource directory, and loads them as a stream of
     * {@link HarvestedStream}.
     *
     * If an error occurs while creating the input stream for a file, the file is ignored
     * and an error is added to the given result builder.
     *
     * If it's plain impossible to read the contents of the directory, an empty stream is returned and
     * an error is added to the given result builder.
     */
    public Stream<HarvestedStream> jsonFiles(HarvestResultBuilder resultBuilder) {
        try {
            return Files.list(this.resourceDir)
                        .filter(path -> path.toString().endsWith(".json"))
                        .sorted() // helps tests, and makes harvesting more stable by harvesting in a well-known order
//                        .parallel()
                        .map(path -> {
                            try {
                                return new HarvestedStream(path.getFileName().toString(), Files.newInputStream(path));
                            }
                            catch (IOException e) {
                                resultBuilder.addGlobalError(
                                    "IOException while opening stream for file " + path + ": " + e
                                );
                                return null;
                            }
                        })
                        .filter(Objects::nonNull);
        }
        catch (IOException e) {
            resultBuilder.addGlobalError(
                "IOException while listing files in directory " + this.resourceDir
            );
            return Stream.empty();
        }
    }

    /**
     * Harvests the given harvested stream, i.e. parses the stream as a JSON array, and parses each
     * element of the array as a {@link Document}. This method creates and records all the successes
     * and errors in a new {@link HarvestedFile} of the given result builder.
     */
    public void harvest(HarvestedStream harvestedStream, HarvestResultBuilder resultBuilder) {
        HarvestedFileBuilder fileBuilder = HarvestedFile.builder(harvestedStream.getFileName());
        int index = 0;

        List<I> batch = new ArrayList<>(BATCH_SIZE);

        try (BufferedInputStream bis = new BufferedInputStream(harvestedStream.getInputStream());
             JsonParser parser = objectMapper.getFactory().createParser(bis)) {

            if (parser.nextToken() != JsonToken.START_ARRAY) {
                fileBuilder.addError(0,
                                     "Expected a JSON array",
                                     parser.getCurrentLocation().getLineNr(),
                                     parser.getCurrentLocation().getColumnNr());
            }
            else {
//                String pathname = harvestedStream.getFileName() + ".indexed.json";
//                File f = new File(tempDir.toAbsolutePath().toString() + "/" + pathname);
                for (JsonToken jsonToken = parser.nextToken(); jsonToken != JsonToken.END_ARRAY; jsonToken = parser.nextToken()) {
                    if (jsonToken != JsonToken.START_OBJECT) {
                        fileBuilder.addError(index,
                                             "Expected a JSON object. Aborting the harvesting process for this file",
                                             parser.getCurrentLocation().getLineNr(),
                                             parser.getCurrentLocation().getColumnNr());
                        break;
                    }

                    try {
                        // necessary to avoid failing in the middle of an object
                        TreeNode treeNode = objectMapper.readTree(parser);
                        D document = objectMapper.treeToValue(treeNode, getDocumentClass());
                        batch.add(toIndexedDocument(document));
                        if (batch.size() == BATCH_SIZE) {
                            documentDao.saveAll(batch);
//                            objectMapper
////                                    .writerWithDefaultPrettyPrinter()
//                                    .writeValue(f,batch);
                            fileBuilder.addSuccesses(batch.size());
                            batch = new ArrayList<>(BATCH_SIZE);
                        }
                    }
                    catch (IOException e) {
                        fileBuilder.addError(index,
                                             "Error while parsing object: " + e,
                                             parser.getCurrentLocation().getLineNr(),
                                             parser.getCurrentLocation().getColumnNr());
                    }

                    index++;
                }

                if (!batch.isEmpty()) {
//                    objectMapper
////                            .writerWithDefaultPrettyPrinter()
//                            .writeValue(f,batch);
                    documentDao.saveAll(batch);
                    fileBuilder.addSuccesses(batch.size());
                }
            }
        }
        catch(Exception e){
            fileBuilder.addError(index,
                                 "Exception occurred while processing file: " + e,
                                 0,
                                 0);
        }

        resultBuilder.withFile(fileBuilder.build());
    }

    protected abstract Class<D> getDocumentClass();
    protected abstract I toIndexedDocument(D document);
}
