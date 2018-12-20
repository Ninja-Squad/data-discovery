package fr.inra.urgi.datadiscovery.harvest.rare;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.datadiscovery.config.DataDiscoveryProperties;
import fr.inra.urgi.datadiscovery.config.Harvest;
import fr.inra.urgi.datadiscovery.config.HarvestConfig;
import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import fr.inra.urgi.datadiscovery.domain.rare.RareIndexedDocument;
import fr.inra.urgi.datadiscovery.harvest.HarvestResult;
import fr.inra.urgi.datadiscovery.harvest.HarvestResult.HarvestResultBuilder;
import fr.inra.urgi.datadiscovery.harvest.HarvestedFile;
import fr.inra.urgi.datadiscovery.harvest.HarvestedStream;
import org.elasticsearch.action.index.IndexRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junitpioneer.jupiter.TempDirectory;
import org.junitpioneer.jupiter.TempDirectory.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for {@link RareHarvester}
 * @author JB Nizet
 */
@TestInstance(Lifecycle.PER_CLASS)
@ExtendWith({MockitoExtension.class, TempDirectory.class, SpringExtension.class})
@JsonTest
@Import(HarvestConfig.class)
class RareHarvesterTest {

    @Mock
    private RareDocumentDao mockDocumentDao;

    @Autowired
    @Harvest
    private ObjectMapper objectMapper;

    @Captor
    private ArgumentCaptor<List<IndexRequest>> indexRequestCaptor;

    private RareHarvester harvester;

    private Path resourceDir;

    @BeforeEach
    void prepare(@TempDir Path tempDir) throws IOException {
        resourceDir = tempDir.resolve("resources");
        Files.createDirectory(resourceDir);

        for (String fileName : Arrays.asList("test1.json", "test2.json")) {
            Files.copy(RareHarvesterTest.class.getResourceAsStream("resourceDir/" + fileName), resourceDir.resolve(fileName));
        }

        DataDiscoveryProperties dataDiscoveryProperties = new DataDiscoveryProperties();
        dataDiscoveryProperties.setResourceDir(resourceDir);
        harvester = new RareHarvester(dataDiscoveryProperties, objectMapper, mockDocumentDao);
    }

    @Test
    void shouldListJsonFiles() throws IOException {
        HarvestResultBuilder resultBuilder = HarvestResult.builder();
        List<HarvestedStream> jsonFiles = harvester.jsonFiles(resultBuilder).collect(Collectors.toList());

        assertThat(jsonFiles).hasSize(2);
        assertThat(jsonFiles).extracting(HarvestedStream::getFileName).containsExactly("test1.json", "test2.json");

        List<RareDocument> documents =
            objectMapper.readValue(jsonFiles.get(1).getInputStream(), new TypeReference<List<RareDocument>>() {});
        assertThat(documents).hasSize(1);

        assertThat(resultBuilder.build().getGlobalErrors()).isEmpty();
    }

    @Test
    void shouldHandleErrorWhenListingFiles() throws IOException {
        Files.list(resourceDir).forEach(this::delete);
        delete(resourceDir);

        HarvestResultBuilder resultBuilder = HarvestResult.builder();
        List<HarvestedStream> jsonFiles = harvester.jsonFiles(resultBuilder).collect(Collectors.toList());

        assertThat(jsonFiles).isEmpty();
        assertThat(resultBuilder.build().getGlobalErrors()).hasSize(1);
    }

    @Test
    void shouldHandleErrorWhenOpeningFile() {
        HarvestResultBuilder resultBuilder = HarvestResult.builder();
        Stream<HarvestedStream> stream = harvester.jsonFiles(resultBuilder);

        List<HarvestedStream> jsonFiles = new ArrayList<>();

        stream.forEach(file -> {
            if (file.getFileName().equals("test1.json")) {
                delete(resourceDir.resolve("test2.json"));
            }
            jsonFiles.add(file);
        });

        assertThat(jsonFiles).hasSize(1);
        assertThat(resultBuilder.build().getGlobalErrors()).hasSize(1);
    }

    @Test
    void shouldHarvest() {
        HarvestResultBuilder resultBuilder = HarvestResult.builder();
        Stream<HarvestedStream> stream = harvester.jsonFiles(resultBuilder);

        stream.forEach(file -> harvester.harvest(file, resultBuilder));

        HarvestResult result = resultBuilder.build();

        assertThat(result.getGlobalErrors()).isEmpty();
        assertThat(result.getFiles()).hasSize(2);

        // the first file has 3 documents, but the second one has a list of names instead of a name
        HarvestedFile file1 = result.getFiles().get(0);
        assertThat(file1.getSuccessCount()).isEqualTo(2);
        assertThat(file1.getErrorCount()).isEqualTo(1);
        assertThat(file1.getErrors()).hasSize(1);

        // the second file has 1 document
        HarvestedFile file2 = result.getFiles().get(1);
        assertThat(file2.getSuccessCount()).isEqualTo(1);
        assertThat(file2.getErrorCount()).isEqualTo(0);
        assertThat(file2.getErrors()).hasSize(0);

        verify(mockDocumentDao, times(2)).bulkIndexRequest(indexRequestCaptor.capture());
        List<List<IndexRequest>> batches = indexRequestCaptor.getAllValues();
        assertThat(batches.get(0).stream().map(r -> r.sourceAsMap().get("name"))).containsExactly(
                "Syrah",
                "Bermestia bianca");
        assertThat(batches.get(1).stream().map(r -> r.sourceAsMap().get("name"))).containsExactly("CLIB 197");
    }

    @Test
    public void shouldHandleDocumentWhichIsNotAnArray() {

        HarvestedStream stream = new HarvestedStream("test.json", new ByteArrayInputStream(
            "{}".getBytes(StandardCharsets.UTF_8)
        ));
        HarvestResultBuilder resultBuilder = HarvestResult.builder();
        harvester.harvest(stream, resultBuilder);

        HarvestResult result = resultBuilder.build();
        assertThat(result.getFiles().get(0).getErrors()).hasSize(1);
        assertThat(result.getFiles().get(0).getSuccessCount()).isEqualTo(0);
    }

    @Test
    public void shouldHandleDocumentWhichDoesNotContainObjects() {

        HarvestedStream stream = new HarvestedStream("test.json", new ByteArrayInputStream(
            "[123]".getBytes(StandardCharsets.UTF_8)
        ));
        HarvestResultBuilder resultBuilder = HarvestResult.builder();
        harvester.harvest(stream, resultBuilder);

        HarvestResult result = resultBuilder.build();
        assertThat(result.getFiles().get(0).getErrors()).hasSize(1);
        assertThat(result.getFiles().get(0).getSuccessCount()).isEqualTo(0);
    }

    @Test
    public void shouldHandleIOExceptions() {

        InputStream is = new InputStream() {
            @Override
            public int read() throws IOException {
                throw new IOException();
            }
        };

        HarvestedStream stream = new HarvestedStream("test.json", is);
        HarvestResultBuilder resultBuilder = HarvestResult.builder();
        harvester.harvest(stream, resultBuilder);

        HarvestResult result = resultBuilder.build();
        assertThat(result.getFiles().get(0).getErrors()).hasSize(1);
        assertThat(result.getFiles().get(0).getSuccessCount()).isEqualTo(0);
    }

    @Test
    public void shouldSplitInBatches() throws JsonProcessingException {
        List<RareDocument> documents = new ArrayList<>();
        for (int i = 0; i < 25000; i++) {
            documents.add(RareDocument.builder().withId("id-" + i).build());
        }
        byte[] jsonArray = objectMapper.writeValueAsBytes(documents);

        HarvestedStream stream = new HarvestedStream("test.json", new ByteArrayInputStream(jsonArray));
        HarvestResultBuilder resultBuilder = HarvestResult.builder();
        harvester.harvest(stream, resultBuilder);

        HarvestResult result = resultBuilder.build();
        assertThat(result.getFiles().get(0).getSuccessCount()).isEqualTo(25000);

//        verify(mockDocumentDao, times(3)).saveAll(indexedResourcesCaptor.capture());
        verify(mockDocumentDao, times(3)).bulkIndexRequest(indexRequestCaptor.capture());
        assertThat(indexRequestCaptor.getAllValues().get(0)).hasSize(10000);
        assertThat(indexRequestCaptor.getAllValues().get(1)).hasSize(10000);
        assertThat(indexRequestCaptor.getAllValues().get(2)).hasSize(5000);
    }

    private void delete(Path file) {
        try {
            Files.delete(file);
        }
        catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
