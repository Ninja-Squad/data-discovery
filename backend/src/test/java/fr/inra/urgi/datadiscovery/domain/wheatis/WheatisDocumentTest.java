package fr.inra.urgi.datadiscovery.domain.wheatis;

import java.io.IOException;
import java.util.Collections;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import fr.inra.urgi.datadiscovery.config.Harvest;
import fr.inra.urgi.datadiscovery.config.HarvestConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit test to check that a {@link WheatisDocument} can correctly be marshalled/unmarshaleld to/from JSON
 * @author JB Nizet
 */
@JsonTest
@Import(HarvestConfig.class)
@ExtendWith(SpringExtension.class)
class WheatisDocumentTest {

    @Autowired
    @Harvest
    private ObjectMapper objectMapper;

    @Test
    void shouldMarshallAndUnMarshall() throws IOException {
        WheatisDocument document =
            WheatisDocument.builder()
                                  .withId("14_mtDNA")
                                  .withEntryType("Marker")
                                  .withDatabaseName("Evoltree")
                                  .withDescription("14_mtDNA is a RFLP marker. It is used in GD2 database for the species Pinus banksiana.")
                                  .withUrl("http://www.evoltree.eu/zf2/public/elab/details?id=MARKER_14_mtDNA&st=fulltext&page=1")
                                  .withSpecies(Collections.singletonList("Pinus banksiana"))
                                  .withNode("URGI")
                                  .build();

        String json = objectMapper.writer()
                                  .withFeatures(SerializationFeature.INDENT_OUTPUT)
                                  .writeValueAsString(document);

        WheatisDocument unmarshalled = objectMapper.readValue(json, WheatisDocument.class);

        assertThat(unmarshalled).isEqualTo(document);
    }

    @Test
    void shouldSupportSingleValuedAttribute() throws IOException {
        String json = "{\n" +
            "    \"entryType\": \"Marker\",\n" +
            "    \"databaseName\": \"Evoltree\",\n" +
            "    \"description\": \"14_mtDNA is a RFLP marker. It is used in GD2 database for the species Pinus banksiana.\",\n" +
            "    \"url\": \"http://www.evoltree.eu/zf2/public/elab/details?id=MARKER_14_mtDNA&st=fulltext&page=1\",\n" +
            "    \"species\": \"Pinus banksiana\",\n" +
            "    \"node\": \"URGI\",\n" +
            "    \"name\": \"14_mtDNA\"\n" +
            "  }";

        WheatisDocument document = objectMapper.readValue(json, WheatisDocument.class);

        assertThat(document.getSpecies()).containsExactly("Pinus banksiana");
    }

    @Test
    void shouldSupportNullSpecies() throws IOException {
        String json = "{\n" +
            "    \"entryType\": \"Marker\",\n" +
            "    \"databaseName\": \"Evoltree\",\n" +
            "    \"description\": \"14_mtDNA is a RFLP marker. It is used in GD2 database for the species Pinus banksiana.\",\n" +
            "    \"url\": \"http://www.evoltree.eu/zf2/public/elab/details?id=MARKER_14_mtDNA&st=fulltext&page=1\",\n" +
            "    \"species\": null,\n" +
            "    \"node\": \"URGI\",\n" +
            "    \"name\": \"14_mtDNA\"\n" +
            "  }";

        WheatisDocument document = objectMapper.readValue(json, WheatisDocument.class);

        assertThat(document.getSpecies()).isEmpty();
    }
}
