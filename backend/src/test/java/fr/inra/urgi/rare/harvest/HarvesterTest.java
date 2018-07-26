package fr.inra.urgi.rare.harvest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

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
import fr.inra.urgi.rare.config.Harvest;
import fr.inra.urgi.rare.config.HarvestConfig;
import fr.inra.urgi.rare.config.RareProperties;
import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.domain.GeneticResourceBuilder;
import fr.inra.urgi.rare.domain.IndexedGeneticResource;
import fr.inra.urgi.rare.harvest.HarvestResult.HarvestResultBuilder;
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

/**
 * Unit tests for {@link Harvester}
 * @author JB Nizet
 */
@TestInstance(Lifecycle.PER_CLASS)
@ExtendWith({MockitoExtension.class, TempDirectory.class, SpringExtension.class})
@JsonTest
@Import(HarvestConfig.class)
class HarvesterTest {

    @Mock
    private GeneticResourceDao mockGeneticResourceDao;

    @Autowired
    @Harvest
    private ObjectMapper objectMapper;

    @Captor
    private ArgumentCaptor<Collection<IndexedGeneticResource>> indexedResourcesCaptor;

    private Harvester harvester;

    private Path resourceDir;

    @BeforeEach
    void prepare(@TempDir Path tempDir) throws IOException {
        resourceDir = tempDir.resolve("resources");
        Files.createDirectory(resourceDir);

        for (String fileName : Arrays.asList("test1.json", "test2.json")) {
            Files.copy(HarvesterTest.class.getResourceAsStream("resourcedir/" + fileName), resourceDir.resolve(fileName));
        }

        RareProperties rareProperties = new RareProperties();
        rareProperties.setResourceDir(resourceDir);
        harvester = new Harvester(rareProperties, objectMapper, mockGeneticResourceDao);
    }

    @Test
    void shouldListJsonFiles() throws IOException {
        HarvestResultBuilder resultBuilder = HarvestResult.builder();
        List<HarvestedStream> jsonFiles = harvester.jsonFiles(resultBuilder).collect(Collectors.toList());

        assertThat(jsonFiles).hasSize(2);
        assertThat(jsonFiles).extracting(HarvestedStream::getFileName).containsExactly("test1.json", "test2.json");

        List<GeneticResource> geneticResources =
            objectMapper.readValue(jsonFiles.get(1).getInputStream(), new TypeReference<List<GeneticResource>>() {});
        assertThat(geneticResources).hasSize(1);

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

        stream.forEach(file -> {
            if (file.getFileName().equals("test1.json")) {
                delete(resourceDir.resolve("test2.json"));
            }
        });

        List<HarvestedStream> jsonFiles = harvester.jsonFiles(resultBuilder).collect(Collectors.toList());

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

        // the first file has 3 genetic resources, but the second one has a list of names instead of a name
        HarvestedFile file1 = result.getFiles().get(0);
        assertThat(file1.getSuccessCount()).isEqualTo(2);
        assertThat(file1.getErrorCount()).isEqualTo(1);
        assertThat(file1.getErrors()).hasSize(1);

        // the second file has 1 genetic resource
        HarvestedFile file2 = result.getFiles().get(1);
        assertThat(file2.getSuccessCount()).isEqualTo(1);
        assertThat(file2.getErrorCount()).isEqualTo(0);
        assertThat(file2.getErrors()).hasSize(0);

        verify(mockGeneticResourceDao, times(2)).saveAll(indexedResourcesCaptor.capture());
        List<Collection<IndexedGeneticResource>> batches = indexedResourcesCaptor.getAllValues();
        assertThat(batches.get(0)).extracting(r -> r.getGeneticResource().getName()).containsExactly("Syrah", "Bermestia bianca");
        assertThat(batches.get(1)).extracting(r -> r.getGeneticResource().getName()).containsExactly("CLIB 197");
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
        List<GeneticResource> geneticResources = new ArrayList<>();
        for (int i = 0; i < 250; i++) {
            geneticResources.add(new GeneticResourceBuilder().withId("id-" + i).build());
        }
        byte[] jsonArray = objectMapper.writeValueAsBytes(geneticResources);

        HarvestedStream stream = new HarvestedStream("test.json", new ByteArrayInputStream(jsonArray));
        HarvestResultBuilder resultBuilder = HarvestResult.builder();
        harvester.harvest(stream, resultBuilder);

        HarvestResult result = resultBuilder.build();
        assertThat(result.getFiles().get(0).getSuccessCount()).isEqualTo(250);

        verify(mockGeneticResourceDao, times(3)).saveAll(indexedResourcesCaptor.capture());
        assertThat(indexedResourcesCaptor.getAllValues().get(0)).hasSize(100);
        assertThat(indexedResourcesCaptor.getAllValues().get(1)).hasSize(100);
        assertThat(indexedResourcesCaptor.getAllValues().get(2)).hasSize(50);
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
