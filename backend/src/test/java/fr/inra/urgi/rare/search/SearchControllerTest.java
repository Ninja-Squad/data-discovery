package fr.inra.urgi.rare.search;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.Collections;

import fr.inra.urgi.rare.config.SecurityConfig;
import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.dao.RareAggregation;
import fr.inra.urgi.rare.dao.SearchRefinements;
import fr.inra.urgi.rare.domain.GeneticResource;
import org.elasticsearch.search.aggregations.Aggregations;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.aggregation.impl.AggregatedPageImpl;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

/**
 * MVC tests for {@link SearchController}
 */
@ExtendWith(SpringExtension.class)
@Import(SecurityConfig.class)
@WebMvcTest(controllers = SearchController.class)
class SearchControllerTest {

    @MockBean
    private GeneticResourceDao mockGeneticResourceDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldSearch() throws Exception {
        GeneticResource resource = GeneticResource.builder()
            .withId("CFBP 8402")
            .withName("CFBP 8402")
            .withDescription("Xylella fastidiosa subsp. Pauca, risk group = Quarantine")
            .build();

        PageRequest pageRequest = PageRequest.of(0, SearchController.PAGE_SIZE);
        String query = "pauca";
        when(mockGeneticResourceDao.search(query, false, false, SearchRefinements.EMPTY, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Arrays.asList(resource), pageRequest, 1));

        mockMvc.perform(get("/api/genetic-resources").param("query", query))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.number").value(0))
               .andExpect(jsonPath("$.maxResults").value(SearchController.MAX_RESULTS))
               .andExpect(jsonPath("$.content[0].identifier").value(resource.getId()))
               .andExpect(jsonPath("$.content[0].name").value(resource.getName()))
               .andExpect(jsonPath("$.content[0].description").value(resource.getDescription()))
               .andExpect(jsonPath("$.aggregations").isEmpty());
    }

    @Test
    void shouldSearchAndAggregate() throws Exception {
        GeneticResource resource = GeneticResource.builder()
            .withId("CFBP 8402")
            .withName("CFBP 8402")
            .withDescription("Xylella fastidiosa subsp. Pauca, risk group = Quarantine")
            .build();

        PageRequest pageRequest = PageRequest.of(0, SearchController.PAGE_SIZE);
        String query = "pauca";

        when(mockGeneticResourceDao.search(query, true, false, SearchRefinements.EMPTY, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(
                Arrays.asList(resource),
                pageRequest,
                1,
                new Aggregations(
                    Arrays.asList(new MockTermsAggregation(RareAggregation.DOMAIN.getName(),
                                                           Arrays.asList(new MockBucket("Plantae", 123),
                                                                         new MockBucket("Fungi", 2))),
                                  new MockTermsAggregation(RareAggregation.COUNTRY_OF_ORIGIN.getName(),
                                                           Collections.emptyList())))
                ));

        mockMvc.perform(get("/api/genetic-resources")
                            .param("query", query)
                            .param("agg", "true"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.number").value(0))
               .andExpect(jsonPath("$.content[0].identifier").value(resource.getId()))
               .andExpect(jsonPath("$.content[0].name").value(resource.getName()))
               .andExpect(jsonPath("$.content[0].description").value(resource.getDescription()))
               .andExpect(jsonPath("$.aggregations").isArray())
               .andExpect(jsonPath("$.aggregations[0].name").value(RareAggregation.DOMAIN.getName()))
               .andExpect(jsonPath("$.aggregations[0].buckets").isArray())
               .andExpect(jsonPath("$.aggregations[0].buckets[0].key").value("Plantae"))
               .andExpect(jsonPath("$.aggregations[0].buckets[0].documentCount").value(123))
               .andExpect(jsonPath("$.aggregations[0].buckets[1].key").value("Fungi"))
               .andExpect(jsonPath("$.aggregations[0].buckets[1].documentCount").value(2))
               .andExpect(jsonPath("$.aggregations[0].type").value(RareAggregation.Type.SMALL.toString()))
               .andExpect(jsonPath("$.aggregations[1].name").value(RareAggregation.COUNTRY_OF_ORIGIN.getName()));
    }

    @Test
    void shouldSearchWIthRefinements() throws Exception {
        PageRequest pageRequest = PageRequest.of(1, SearchController.PAGE_SIZE);
        String query = "pauca";

        SearchRefinements expectedRefinements =
            SearchRefinements.builder()
                             .withTerm(RareAggregation.DOMAIN, Arrays.asList("d1"))
                             .withTerm(RareAggregation.BIOTOPE, Arrays.asList("b1", "b2"))
                             .withTerm(RareAggregation.MATERIAL, Arrays.asList("m1"))
                             .build();

        when(mockGeneticResourceDao.search(query, false, false, expectedRefinements, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Collections.emptyList(), pageRequest, 1));

        mockMvc.perform(get("/api/genetic-resources")
                            .param("query", query)
                            .param("page", "1")
                            .param(RareAggregation.DOMAIN.getName(), "d1")
                            .param(RareAggregation.BIOTOPE.getName(), "b2", "b1")
                            .param(RareAggregation.MATERIAL.getName(), "m1"))
               .andExpect(status().isOk());
    }

    @Test
    void shouldThrowIfPageTooLarge() throws Exception {
        int page = SearchController.MAX_RESULTS / SearchController.PAGE_SIZE;
        String query = "pauca";

        mockMvc.perform(get("/api/genetic-resources")
                            .param("query", query)
                            .param("page", Integer.toString(page)))
               .andExpect(status().isBadRequest());
    }
}
