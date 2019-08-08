package fr.inra.urgi.datadiscovery.domain.rare;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import fr.inra.urgi.datadiscovery.config.HarvestConfig;
import fr.inra.urgi.datadiscovery.domain.Location;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit test to check that a {@link RareDocument} can correctly be marshalled/unmarshaleld to/from JSON
 * @author JB Nizet
 */
@JsonTest
@Import(HarvestConfig.class)
@ExtendWith(SpringExtension.class)
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
                               .withDataURL("https://urgi.versailles.inra.fr/gnpis-core/#accessionCard/id=ZG9pOjEwLjE1NDU0LzEuNDkyMTc4NTM1MTUxNjk4RTEy")
                               .withDomain("Plantae")
                               .withTaxon(Collections.singletonList("Vitis vinifera"))
                               .withFamily(Collections.singletonList("Vitaceae"))
                               .withGenus(Collections.singletonList("Vitis"))
                               .withSpecies(Collections.singletonList("Vitis vinifera"))
                               .withMaterialType(Collections.singletonList("testMaterialType"))
                               .withBiotopeType(Collections.singletonList("testBiotopeType"))
                               .withCountryOfOrigin("France")
                               .withLocationOfOrigin(new Location(0.1, 0.2))
                               .withCountryOfCollect("Italy")
                               .withLocationOfCollect(new Location(37.5,15.099722))
                               .build();

        String json = objectMapper.writer()
                                  .withFeatures(SerializationFeature.INDENT_OUTPUT)
                                  .writeValueAsString(document);

        RareDocument unmarshalled = objectMapper.readValue(json, RareDocument.class);

        assertThat(unmarshalled).isEqualTo(document);
    }

    @Test
    void shouldSupportSingleValuedAttributes() throws IOException {
        String json = "{\n" +
            "    \"pillarName\": \"Plant\",\n" +
            "    \"databaseSource\": \"Florilège\",\n" +
            "    \"portalURL\": \"http://florilege.arcad-project.org/fr/collections\",\n" +
            "    \"identifier\": \"doi:10.15454/1.4921785297227607E12\",\n" +
            "    \"name\": \"Syrah\",\n" +
            "    \"description\": \"Syrah is a Vitis vinifera subsp vinifera cv. Syrah accession (number: 150Mtp0, doi:10.15454/1.4921785297227607E12) maintained by the GRAPEVINE (managed by INRA) and held by INRA. It is a maintained/maintenu accession of biological status traditional cultivar/cultivar traditionnel. This accession has phenotyping data: Doligez_et_al_2013 - Study of the genetic determinism of berry weight and seed traits in a grapevine progeny.\",\n" +
            "    \"dataURL\": \"https://urgi.versailles.inra.fr/gnpis-core/#accessionCard/id=ZG9pOjEwLjE1NDU0LzEuNDkyMTc4NTI5NzIyNzYwN0UxMg==\",\n" +
            "    \"domain\": \"Plantae\",\n" +
            "    \"taxon\": \"Vitis vinifera\",\n" +
            "    \"family\": \"Vitaceae\",\n" +
            "    \"genus\": \"Vitis\",\n" +
            "    \"species\": \"Vitis vinifera\",\n" +
            "    \"materialType\": \"Test Material Type\",\n" +
            "    \"biotopeType\": \"Test Biotope Type\",\n" +
            "    \"countryOfOrigin\": null,\n" +
            "    \"locationOfOrigin\": null,\n" +
            "    \"countryOfCollect\": null,\n" +
            "    \"locationOfCollect\": null\n" +
            "}";

        RareDocument document = objectMapper.readValue(json, RareDocument.class);

        assertThat(document.getTaxon()).containsExactly("Vitis vinifera");
        assertThat(document.getFamily()).containsExactly("Vitaceae");
        assertThat(document.getGenus()).containsExactly("Vitis");
        assertThat(document.getSpecies()).containsExactly("Vitis vinifera");
        assertThat(document.getMaterialType()).containsExactly("Test Material Type");
        assertThat(document.getBiotopeType()).containsExactly("Test Biotope Type");
    }
}
