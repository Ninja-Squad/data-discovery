package fr.inra.urgi.datadiscovery.domain.faidare;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import fr.inra.urgi.datadiscovery.domain.GeographicLocationDocument;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

/**
 * Unit test to check that a {@link FaidareDocument} can correctly be marshalled/unmarshaleld to/from JSON
 * @author JB Nizet
 */
@JsonTest
class FaidareDocumentTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldMarshallAndUnMarshall() throws IOException {
        FaidareDocument document =
            FaidareDocument.builder()
                           .withId("doc1")
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
                           .withHoldingInstitute("INRAE")
                           .withBiologicalStatus("Natural")
                           .withGeneticNature("Genetic nature 1")
                           .withTaxonGroup(Collections.singletonList("Taxon group 1"))
                           .withObservationVariableIds(Collections.singletonList("OV1"))
                           .withCountryOfOrigin("France")
                           .withGermplasmDbId("gerplasm1")
                           .withGroupId(42)
                           .withGeographicLocations(List.of(new GeographicLocationDocument("site1", "Site 1", "siteType1", 2.5, 3.6)))
                           .build();

        String json = objectMapper.writer()
                                  .withFeatures(SerializationFeature.INDENT_OUTPUT)
                                  .writeValueAsString(document);

        FaidareDocument unmarshalled = objectMapper.readValue(json, FaidareDocument.class);

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

        FaidareDocument document = objectMapper.readValue(json, FaidareDocument.class);

        assertThat(document.getSpecies()).containsExactly("Pinus banksiana");
        assertThat(document.getGeographicLocations()).isEmpty();
    }

    @Test
    void shouldSupportNullSpeciesAndGeographicLocations() throws IOException {
        String json = "{\n" +
            "    \"entryType\": \"Marker\",\n" +
            "    \"databaseName\": \"Evoltree\",\n" +
            "    \"description\": \"14_mtDNA is a RFLP marker. It is used in GD2 database for the species Pinus banksiana.\",\n" +
            "    \"url\": \"http://www.evoltree.eu/zf2/public/elab/details?id=MARKER_14_mtDNA&st=fulltext&page=1\",\n" +
            "    \"species\": null,\n" +
            "    \"node\": \"URGI\",\n" +
            "    \"name\": \"14_mtDNA\",\n" +
            "    \"geographicLocation\": null\n" +
            "  }";

        FaidareDocument document = objectMapper.readValue(json, FaidareDocument.class);

        assertThat(document.getSpecies()).isEmpty();
        assertThat(document.getGeographicLocations()).isEmpty();
    }
}
