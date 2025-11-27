package fr.inra.urgi.datadiscovery.domain.wheatis;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.Collections;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.SerializationFeature;

/**
 * Unit test to check that a {@link WheatisDocument} can correctly be marshalled/unmarshaleld to/from JSON
 * @author JB Nizet
 */
@JsonTest
class WheatisDocumentTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldMarshallAndUnMarshall() throws IOException {
        WheatisDocument document =
            WheatisDocument.builder()
                           .withName("14_mtDNA")
                           .withEntryType("Marker")
                           .withDatabaseName("Evoltree")
                           .withDescription("14_mtDNA is a RFLP marker. It is used in GD2 database for the species Pinus banksiana.")
                           .withUrl("http://www.evoltree.eu/zf2/public/elab/details?id=MARKER_14_mtDNA&st=fulltext&page=1")
                           .withSpecies(Collections.singletonList("Pinus banksiana"))
                           .withNode("URGI")
                           .withAnnotationId(Collections.singletonList("annotation id 1"))
                           .withAnnotationName(Collections.singletonList("annotation name 1"))
                           .withAncestors(Collections.singletonList("ancestors"))
                           .build();

        String json = objectMapper.writer()
                                  .withFeatures(SerializationFeature.INDENT_OUTPUT)
                                  .writeValueAsString(document);

        WheatisDocument unmarshalled = objectMapper.readValue(json, WheatisDocument.class);

        assertThat(unmarshalled).isEqualTo(document);
    }

    @Test
    void shouldSupportSingleValuedAttribute() throws IOException {
        String json =
              """
              {
                "entryType": "Marker",
                "databaseName": "Evoltree",
                "description": "14_mtDNA is a RFLP marker. It is used in GD2 database for the species Pinus banksiana.",
                "url": "http://www.evoltree.eu/zf2/public/elab/details?id=MARKER_14_mtDNA&st=fulltext&page=1",
                "species": "Pinus banksiana",
                "node": "URGI",
                "name": "14_mtDNA"
              }
              """;

        WheatisDocument document = objectMapper.readValue(json, WheatisDocument.class);

        assertThat(document.getSpecies()).containsExactly("Pinus banksiana");
    }

    @Test
    void shouldSupportNullSpecies() throws IOException {
        String json = """
                {
                "entryType": "Marker",
                "databaseName": "Evoltree",
                "description": "14_mtDNA is a RFLP marker. It is used in GD2 database for the species Pinus banksiana.",
                "url": "http://www.evoltree.eu/zf2/public/elab/details?id=MARKER_14_mtDNA&st=fulltext&page=1",
                "species": null,
                "node": "URGI",
                "name": "14_mtDNA"
              }
              """;

        WheatisDocument document = objectMapper.readValue(json, WheatisDocument.class);

        assertThat(document.getSpecies()).isEmpty();
    }
}
