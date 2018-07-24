package fr.inra.urgi.rare.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.Collections;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import fr.inra.urgi.rare.config.Harvest;
import fr.inra.urgi.rare.config.HarvestConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Unit test to check that a GeneticResource can correctly be marshalled/unmarshaleld to/from JSON
 * @author JB Nizet
 */
@JsonTest
@Import(HarvestConfig.class)
@ExtendWith(SpringExtension.class)
class GeneticResourceTest {

    @Autowired
    @Harvest
    private ObjectMapper objectMapper;

    @Test
    void shouldMarshallAndUnMarshall() throws IOException {
        GeneticResource geneticResource =
            new GeneticResource(
                "doi:10.15454/1.492178535151698E12",
                "Grecanico dorato",
                "Grecanico dorato is a Vitis vinifera subsp vinifera cv. Garganega accession (number: "
                    + "1310Mtp1, doi:10.15454/1.492178535151698E12) maintained by the GRAPEVINE (managed by INRA) and held "
                    + "by INRA. It is a maintained/maintenu accession of biological status traditional cultivar/cultivar "
                    + "traditionnel",
                "Plant",
                "Florilège",
                "http://florilege.arcad-project.org/fr/collections",
                "https://urgi.versailles.inra.fr/gnpis-core/#accessionCard/id=ZG9pOjEwLjE1NDU0LzEuNDkyMTc4NTM1MTUxNjk4RTEy",
                "Plantae",
                Collections.singletonList("Vitis vinifera"),
                Collections.singletonList("Vitaceae"),
                Collections.singletonList("Vitis"),
                Collections.singletonList("Vitis vinifera"),
                Collections.singletonList("testMaterialType"),
                Collections.singletonList("testBiotopeType"),
                "France",
                0.1,
                0.2,
                "Italy",
                37.5,
                15.099722);

        String json = objectMapper.writer()
                                  .withFeatures(SerializationFeature.INDENT_OUTPUT)
                                  .writeValueAsString(geneticResource);

        GeneticResource unmarshalled = objectMapper.readValue(json, GeneticResource.class);

        assertThat(unmarshalled).isEqualTo(geneticResource);
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
            "    \"originLatitude\": null,\n" +
            "    \"originLongitude\": null,\n" +
            "    \"countryOfCollect\": null,\n" +
            "    \"collectLatitude\": null,\n" +
            "    \"collectLongitude\": null\n" +
            "}";

        GeneticResource geneticResource = objectMapper.readValue(json, GeneticResource.class);

        assertThat(geneticResource.getTaxon()).containsExactly("Vitis vinifera");
        assertThat(geneticResource.getFamily()).containsExactly("Vitaceae");
        assertThat(geneticResource.getGenus()).containsExactly("Vitis");
        assertThat(geneticResource.getSpecies()).containsExactly("Vitis vinifera");
        assertThat(geneticResource.getMaterialType()).containsExactly("Test Material Type");
        assertThat(geneticResource.getBiotopeType()).containsExactly("Test Biotope Type");
    }
}
