package fr.inra.urgi.datadiscovery.domain.rare;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.Collections;

import fr.inra.urgi.datadiscovery.domain.GeographicLocationDocument;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.SerializationFeature;

/**
 * Unit test to check that a {@link RareDocument} can correctly be marshalled/unmarshaleld to/from JSON
 * @author JB Nizet
 */
@JsonTest
class RareDocumentTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldMarshallAndUnMarshall() throws IOException {
        RareDocument document =
            RareDocument.builder()
                               .withId("doi:10.15454/1.492178535151698E12")
                               .withName("Grecanico dorato")
                               .withDescription("Grecanico dorato is a Vitis vinifera subsp vinifera cv. Garganega accession (number: "
                                + "1310Mtp1, doi:10.15454/1.492178535151698E12) maintained by the GRAPEVINE (managed by INRA) and held "
                                + "by INRA. It is a maintained/maintenu accession of biological status traditional cultivar/cultivar "
                                + "traditionnel")
                               .withPillarName("Plant")
                               .withDatabaseSource("Florilège")
                               .withPortalURL("http://florilege.arcad-project.org/fr/collections")
                               .withDataURL("https://urgi.versailles.inrae.fr/faidare/#accessionCard/id=ZG9pOjEwLjE1NDU0LzEuNDkyMTc4NTM1MTUxNjk4RTEy")
                               .withDomain("Plantae")
                               .withAccessionHolder("AH1")
                               .withTaxon(Collections.singletonList("Vitis vinifera"))
                               .withFamily(Collections.singletonList("Vitaceae"))
                               .withGenus(Collections.singletonList("Vitis"))
                               .withSpecies(Collections.singletonList("Vitis vinifera"))
                               .withMaterialType(Collections.singletonList("testMaterialType"))
                               .withBiotopeType(Collections.singletonList("testBiotopeType"))
                               .withCountryOfOrigin("France")
                               .withLocationOfOrigin(new GeographicLocationDocument("1", "TestSiteName1", "Origin site", 0.1, 0.2))
                               .withCountryOfCollect("Italy")
                               .withLocationOfCollect(new GeographicLocationDocument("2", "TestSiteName2", "Collecting site ",37.5,15.099722))
                               .build();

        String json = objectMapper.writer()
                                  .withFeatures(SerializationFeature.INDENT_OUTPUT)
                                  .writeValueAsString(document);

        RareDocument unmarshalled = objectMapper.readValue(json, RareDocument.class);

        assertThat(unmarshalled).isEqualTo(document);
    }

    @Test
    void shouldSupportSingleValuedAttributes() throws IOException {
        String json =
              """
              {
                "pillarName": "Plant",
                "databaseSource": "Florilège",
                "portalURL": "http://florilege.arcad-project.org/fr/collections",
                "identifier": "doi:10.15454/1.4921785297227607E12",
                "name": "Syrah",
                "description": "Syrah is a Vitis vinifera subsp vinifera cv. Syrah accession (number: 150Mtp0, doi:10.15454/1.4921785297227607E12) maintained by the GRAPEVINE (managed by INRA) and held by INRA. It is a maintained/maintenu accession of biological status traditional cultivar/cultivar traditionnel. This accession has phenotyping data: Doligez_et_al_2013 - Study of the genetic determinism of berry weight and seed traits in a grapevine progeny.",
                "dataURL": "https://urgi.versailles.inrae.fr/faidare/#accessionCard/id=ZG9pOjEwLjE1NDU0LzEuNDkyMTc4NTI5NzIyNzYwN0UxMg==",
                "domain": "Plantae",
                "accessionHolder": "AH1",
                "taxon": "Vitis vinifera",
                "family": "Vitaceae",
                "genus": "Vitis",
                "species": "Vitis vinifera",
                "materialType": "Test Material Type",
                "biotopeType": "Test Biotope Type",
                "countryOfOrigin": null,
                "locationOfOrigin": null,
                "countryOfCollect": null,
                "locationOfCollect": null
              }
              """;

        RareDocument document = objectMapper.readValue(json, RareDocument.class);

        assertThat(document.getTaxon()).containsExactly("Vitis vinifera");
        assertThat(document.getFamily()).containsExactly("Vitaceae");
        assertThat(document.getGenus()).containsExactly("Vitis");
        assertThat(document.getSpecies()).containsExactly("Vitis vinifera");
        assertThat(document.getMaterialType()).containsExactly("Test Material Type");
        assertThat(document.getBiotopeType()).containsExactly("Test Biotope Type");
    }
}
