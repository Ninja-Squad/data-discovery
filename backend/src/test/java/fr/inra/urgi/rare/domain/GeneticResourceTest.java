package fr.inra.urgi.rare.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Unit test to check that a GeneticResource can correctly be marshalled/unmarshaleld to/from JSON
 * @author JB Nizet
 */
@JsonTest
@ExtendWith(SpringExtension.class)
class GeneticResourceTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void shouldMarshallAndUnMarshall() throws IOException {
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
                "Vitis vinifera",
                "Vitaceae",
                "Vitis",
                "Vitis vinifera",
                "testMaterialType",
                "testBiotopeType",
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
}
