package fr.inra.urgi.datadiscovery.harvest.wheatis;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.datadiscovery.config.DataDiscoveryProperties;
import fr.inra.urgi.datadiscovery.config.Harvest;
import fr.inra.urgi.datadiscovery.config.HarvestConfig;
import fr.inra.urgi.datadiscovery.dao.wheatis.WheatisDocumentDao;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisDocument;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisIndexedDocument;
import fr.inra.urgi.datadiscovery.harvest.HarvestResult;
import fr.inra.urgi.datadiscovery.harvest.HarvestedFile;
import fr.inra.urgi.datadiscovery.harvest.HarvestedStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junitpioneer.jupiter.TempDirectory;
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
 * Unit tests for {@link WheatisHarvester}
 * @author JB Nizet
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ExtendWith({MockitoExtension.class, TempDirectory.class, SpringExtension.class})
@JsonTest
@Import(HarvestConfig.class)
class WheatisHarvesterTest {
    @Mock
    private WheatisDocumentDao mockDocumentDao;

    @Autowired
    @Harvest
    private ObjectMapper objectMapper;

    @Captor
    private ArgumentCaptor<Collection<WheatisIndexedDocument>> indexedResourcesCaptor;

    private WheatisHarvester harvester;

    private Path resourceDir;

    @BeforeEach
    void prepare(@TempDirectory.TempDir Path tempDir) throws IOException {
        resourceDir = tempDir.resolve("resources");
        Files.createDirectory(resourceDir);

        for (String fileName : Arrays.asList("test1.json", "test2.json")) {
            Files.copy(WheatisHarvesterTest.class.getResourceAsStream("resourceDir/" + fileName), resourceDir.resolve(fileName));
        }

        DataDiscoveryProperties dataDiscoveryProperties = new DataDiscoveryProperties();
        dataDiscoveryProperties.setResourceDir(resourceDir);
        harvester = new WheatisHarvester(dataDiscoveryProperties, objectMapper, mockDocumentDao);
    }

    @Test
    void shouldListJsonFiles() throws IOException {
        HarvestResult.HarvestResultBuilder resultBuilder = HarvestResult.builder();
        List<HarvestedStream> jsonFiles = harvester.jsonFiles(resultBuilder).collect(Collectors.toList());

        assertThat(jsonFiles).hasSize(2);
        assertThat(jsonFiles).extracting(HarvestedStream::getFileName).containsExactly("test1.json", "test2.json");

        List<WheatisDocument> documents =
            objectMapper.readValue(jsonFiles.get(1).getInputStream(), new TypeReference<List<WheatisDocument>>() {});
        assertThat(documents).hasSize(1);

        assertThat(resultBuilder.build().getGlobalErrors()).isEmpty();
    }

    @Test
    void shouldHarvest() {
        HarvestResult.HarvestResultBuilder resultBuilder = HarvestResult.builder();
        Stream<HarvestedStream> stream = harvester.jsonFiles(resultBuilder);

        stream.forEach(file -> harvester.harvest(file, resultBuilder));

        HarvestResult result = resultBuilder.build();

        assertThat(result.getGlobalErrors()).isEmpty();
        assertThat(result.getFiles()).hasSize(2);

        // the first file has 3 documents
        HarvestedFile file1 = result.getFiles().get(0);
        assertThat(file1.getSuccessCount()).isEqualTo(3);
        assertThat(file1.getErrorCount()).isEqualTo(0);
        assertThat(file1.getErrors()).hasSize(0);

        // the second file has 1 document
        HarvestedFile file2 = result.getFiles().get(1);
        assertThat(file2.getSuccessCount()).isEqualTo(1);
        assertThat(file2.getErrorCount()).isEqualTo(0);
        assertThat(file2.getErrors()).hasSize(0);

        verify(mockDocumentDao, times(2)).saveAll(indexedResourcesCaptor.capture());
        List<Collection<WheatisIndexedDocument>> batches = indexedResourcesCaptor.getAllValues();
        assertThat(batches.get(0)).extracting(r -> r.getDocument().getId())
                                  .containsExactly("chr01:103412796..103413479",
                                                   "chr01:103412796..103413480",
                                                   "chr01:104609140..104609827");
        assertThat(batches.get(1)).extracting(r -> r.getDocument().getId()).containsExactly("14_mtDNA");
    }
}
