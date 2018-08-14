package fr.inra.urgi.rare.harvest;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.core.TreeNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.rare.config.RareProperties;
import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.domain.IndexedGeneticResource;
import fr.inra.urgi.rare.harvest.HarvestResult.HarvestResultBuilder;
import fr.inra.urgi.rare.harvest.HarvestedFile.HarvestedFileBuilder;
import org.springframework.stereotype.Component;

/**
 * A harvester, which can load all the JSON files located in the Rare resource directory, and then, for each of these
 * files, parse the array of genetic resources it's supposed to contain, and insert them in Elastic Search
 *
 * To avoid aborting with an exception, and instead provide a useful diagnostic, this harvester records the errors
 * happening during the harvesting process into an {@link HarvestResult}, using its builder.
 *
 * Since the files can be large, instead of parsing the whole array, the streaming API of Jackson is used to
 * parse the genetic resource inside the array one by one. This allows being faster, and to consume much less memory.
 *
 * @author JB Nizet
 */
@Component
public class Harvester {

    private static final int BATCH_SIZE = 100;

    private final Path resourceDir;
    private final ObjectMapper objectMapper;
    private final GeneticResourceDao geneticResourceDao;

    public Harvester(RareProperties rareProperties,
                     ObjectMapper objectMapper,
                     GeneticResourceDao geneticResourceDao) {
        this.resourceDir = rareProperties.getResourceDir();
        this.objectMapper = objectMapper;
        this.geneticResourceDao = geneticResourceDao;
    }

    /**
     * Finds all the JSON files located inside the Rare resource directory, and loads them as a stream of
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
     * element of the array as a {@link GeneticResource}. This method creates and records all the successes
     * and errors in a new {@link HarvestedFile} of the given result builder.
     */
    public void harvest(HarvestedStream harvestedStream, HarvestResultBuilder resultBuilder) {
        HarvestedFileBuilder fileBuilder = HarvestedFile.builder(harvestedStream.getFileName());
        int index = 0;

        List<IndexedGeneticResource> batch = new ArrayList<>(BATCH_SIZE);

        try (BufferedInputStream bis = new BufferedInputStream(harvestedStream.getInputStream());
             JsonParser parser = objectMapper.getFactory().createParser(bis)) {

            if (parser.nextToken() != JsonToken.START_ARRAY) {
                fileBuilder.addError(0,
                                     "Expected a JSON array",
                                     parser.getCurrentLocation().getLineNr(),
                                     parser.getCurrentLocation().getColumnNr());
            }
            else {
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
                        GeneticResource geneticResource = objectMapper.treeToValue(treeNode, GeneticResource.class);
                        batch.add(new IndexedGeneticResource(geneticResource));
                        if (batch.size() == BATCH_SIZE) {
                            geneticResourceDao.saveAll(batch);
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
                    geneticResourceDao.saveAll(batch);
                    fileBuilder.addSuccesses(batch.size());
                }
            }
        }
        catch(IOException e){
            fileBuilder.addError(index,
                                 "IOException while parsing file: " + e,
                                 0,
                                 0);
        }

        resultBuilder.withFile(fileBuilder.build());
    }
}
