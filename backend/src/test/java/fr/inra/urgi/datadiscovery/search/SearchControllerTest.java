package fr.inra.urgi.datadiscovery.search;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import fr.inra.urgi.datadiscovery.config.SecurityConfig;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.dao.rare.RareAggregation;
import fr.inra.urgi.datadiscovery.dao.rare.RareAggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import org.elasticsearch.search.aggregations.Aggregations;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.aggregation.impl.AggregatedPageImpl;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MVC tests for {@link SearchController}
 */
@ExtendWith(SpringExtension.class)
@Import(SecurityConfig.class)
@WebMvcTest(controllers = SearchController.class)
class SearchControllerTest {

    @MockBean
    private RareDocumentDao mockDocumentDao;

    @SpyBean
    private RareAggregationAnalyzer aggregationAnalyzer;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldSearch() throws Exception {
        RareDocument resource = RareDocument.builder()
                                                          .withId("CFBP 8402")
                                                          .withName("CFBP 8402")
                                                          .withDescription("Xylella fastidiosa subsp. Pauca, risk group = Quarantine")
                                                          .build();

        PageRequest pageRequest = PageRequest.of(0, SearchController.PAGE_SIZE);
        String query = "pauca";
        when(mockDocumentDao.search(query, false, SearchRefinements.EMPTY, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Arrays.asList(resource), pageRequest, 1));

        mockMvc.perform(get("/api/documents").param("query", query))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.number").value(0))
               .andExpect(jsonPath("$.maxResults").value(SearchController.MAX_RESULTS))
               .andExpect(jsonPath("$.content[0].identifier").value(resource.getId()))
               .andExpect(jsonPath("$.content[0].name").value(resource.getName()))
               .andExpect(jsonPath("$.content[0].description").value(resource.getDescription()))
               .andExpect(jsonPath("$.aggregations").isEmpty());
    }

    @Test
    void shouldAggregate() throws Exception {
        RareDocument resource = RareDocument.builder()
                                                          .withId("CFBP 8402")
                                                          .withName("CFBP 8402")
                                                          .withDescription("Xylella fastidiosa subsp. Pauca, risk group = Quarantine")
                                                          .build();

        PageRequest pageRequest = PageRequest.of(0, SearchController.PAGE_SIZE);
        String query = "pauca";

        List<MockTermsAggregation> aggregations = new ArrayList<>();
        aggregations.add(new MockTermsAggregation(RareAggregation.DOMAIN.getName(),
                                                  Arrays.asList(new MockBucket("Plantae", 123),
                                                                new MockBucket("Fungi", 2))));
        for (RareAggregation rareAggregation : RareAggregation.values()) {
            if (rareAggregation != RareAggregation.DOMAIN) {
                aggregations.add(new MockTermsAggregation(RareAggregation.COUNTRY_OF_COLLECT.getName(),
                                                          Collections.emptyList()));
            }
        }
        // return aggregations in a random order
        Collections.shuffle(aggregations);

        when(mockDocumentDao.aggregate(query,  SearchRefinements.EMPTY))
            .thenReturn(new AggregatedPageImpl<>(
                Arrays.asList(resource),
                pageRequest,
                1,
                new Aggregations(
                    Arrays.asList(new MockTermsAggregation(RareAggregation.DOMAIN.getName(),
                                                           Arrays.asList(new MockBucket("Plantae", 123),
                                                                         new MockBucket("Fungi", 2))),
                                  new MockTermsAggregation(RareAggregation.COUNTRY_OF_COLLECT.getName(),
                                                           Collections.emptyList()),
                                  new MockTermsAggregation(RareAggregation.COUNTRY_OF_ORIGIN.getName(),
                                                           Collections.emptyList()),
                                  new MockTermsAggregation(RareAggregation.MATERIAL.getName(),
                                                           Collections.emptyList()),
                                  new MockTermsAggregation(RareAggregation.BIOTOPE.getName(),
                                                           Collections.emptyList()),
                                  new MockTermsAggregation(RareAggregation.TAXON.getName(),
                                                           Collections.emptyList())))
                ));

        ResultActions resultActions =
            mockMvc.perform(get("/api/documents-aggregate")
                                                          .param("query", query)
                                                          .param("aggregate", "true"))
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
                   .andExpect(jsonPath("$.aggregations[0].type").value(RareAggregation.Type.LARGE.toString()));

        // check that the aggregations are sorted in the order of the enum
        for (int i = 0; i < RareAggregation.values().length; i++) {
            resultActions.andExpect(jsonPath("$.aggregations[" + i + "].name")
                                        .value(RareAggregation.values()[i].getName()));
        }
    }

    @Test
    void shouldSearchWithRefinements() throws Exception {
        PageRequest pageRequest = PageRequest.of(1, SearchController.PAGE_SIZE);
        String query = "pauca";

        SearchRefinements expectedRefinements =
            SearchRefinements.builder()
                             .withTerm(RareAggregation.DOMAIN, Arrays.asList("d1"))
                             .withTerm(RareAggregation.BIOTOPE, Arrays.asList("b1", "b2"))
                             .withTerm(RareAggregation.MATERIAL, Arrays.asList("m1"))
                             .build();

        when(mockDocumentDao.search(query, false, expectedRefinements, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Collections.emptyList(), pageRequest, 1));

        mockMvc.perform(get("/api/documents")
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

        mockMvc.perform(get("/api/documents")
                            .param("query", query)
                            .param("page", Integer.toString(page)))
               .andExpect(status().isBadRequest());
    }
}
