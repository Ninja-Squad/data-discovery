package fr.inra.urgi.rare.pillar;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.Collections;

import fr.inra.urgi.rare.config.SecurityConfig;
import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.search.MockBucket;
import fr.inra.urgi.rare.search.MockTermsAggregation;
import org.elasticsearch.search.aggregations.Aggregations;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.hamcrest.CoreMatchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Unit tests for {@link PillarController}
 * @author JB Nizet
 */
@ExtendWith(SpringExtension.class)
@Import(SecurityConfig.class)
@WebMvcTest(controllers = PillarController.class)
class PillarControllerTest {

    @MockBean
    private GeneticResourceDao mockGeneticResourceDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldListPillars() throws Exception {
        Terms pillarTerms = new MockTermsAggregation("pillar", Arrays.asList(
            new MockBucket("Plant", 999, new Aggregations(Arrays.asList( // wrong approximate count
                new MockTermsAggregation(GeneticResourceDao.DATABASE_SOURCE_AGGREGATION_NAME, Arrays.asList(
                    new MockBucket("Florilège", 800, new Aggregations(Arrays.asList(
                        new MockTermsAggregation(GeneticResourceDao.PORTAL_URL_AGGREGATION_NAME, Collections.singletonList(
                            new MockBucket("http://florilege.arcad-project.org/fr/collections", 800)
                        ))
                    ))),
                    new MockBucket("CNRGV", 200, new Aggregations(Arrays.asList(
                        new MockTermsAggregation(GeneticResourceDao.PORTAL_URL_AGGREGATION_NAME, Arrays.asList(
                            new MockBucket("https://cnrgv.toulouse.inra.fr/library/genomic_resource/ Aha-B-H25", 799),
                            new MockBucket("https://cnrgv.toulouse.inra.fr/library/genomic_resource/ Aha-B-H26", 1) // 2 URLS instead of 1
                        ))
                    )))
                ))
            ))),
            new MockBucket("Forest", 500, new Aggregations(Arrays.asList(
                new MockTermsAggregation(GeneticResourceDao.DATABASE_SOURCE_AGGREGATION_NAME, Arrays.asList(
                    new MockBucket("GnpIS", 500, new Aggregations(Arrays.asList(
                        new MockTermsAggregation(GeneticResourceDao.PORTAL_URL_AGGREGATION_NAME, Collections.emptyList()) // no URL
                    )))
                ))
            )))
        ));
        when(mockGeneticResourceDao.findPillars()).thenReturn(pillarTerms);

        mockMvc.perform(get("/api/pillars"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$").isArray())
               .andExpect(jsonPath("$[0].name").value("Plant"))
               .andExpect(jsonPath("$[0].documentCount").value(1000))
               .andExpect(jsonPath("$[0].databaseSources").isArray())
               .andExpect(jsonPath("$[0].databaseSources[0].name").value("Florilège"))
               .andExpect(jsonPath("$[0].databaseSources[0].documentCount").value(800))
               .andExpect(jsonPath("$[0].databaseSources[0].url")
                              .value("http://florilege.arcad-project.org/fr/collections"))
               .andExpect(jsonPath("$[0].databaseSources[1].name").value("CNRGV"))
               .andExpect(jsonPath("$[0].databaseSources[1].documentCount").value(200))
               .andExpect(jsonPath("$[0].databaseSources[1].url")
                              .value("https://cnrgv.toulouse.inra.fr/library/genomic_resource/ Aha-B-H25"))
               .andExpect(jsonPath("$[1].name").value("Forest"))
               .andExpect(jsonPath("$[1].documentCount").value(500))
               .andExpect(jsonPath("$[1].databaseSources").isArray())
               .andExpect(jsonPath("$[1].databaseSources[0].name").value("GnpIS"))
               .andExpect(jsonPath("$[1].databaseSources[0].documentCount").value(500))
               .andExpect(jsonPath("$[1].databaseSources[0].url").value(CoreMatchers.nullValue()));
    }
}
