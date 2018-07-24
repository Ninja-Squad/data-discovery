package fr.inra.urgi.rare.dao;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Collections;

import fr.inra.urgi.rare.config.ElasticSearchConfig;
import fr.inra.urgi.rare.domain.GeneticResource;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@TestPropertySource("/test.properties")
@SpringBootTest(classes = ElasticSearchConfig.class)
@JsonTest
class GeneticResourceDaoTest {

    @Autowired
    private GeneticResourceDao geneticResourceDao;

    @Test
    void shouldSaveAndGet() {

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

        geneticResourceDao.save(geneticResource);

        assertThat(geneticResourceDao.findById(geneticResource.getId()).get()).isEqualTo(geneticResource);
    }
}

