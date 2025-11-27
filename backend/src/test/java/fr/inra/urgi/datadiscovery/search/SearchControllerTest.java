package fr.inra.urgi.datadiscovery.search;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import fr.inra.urgi.datadiscovery.config.SecurityConfig;
import fr.inra.urgi.datadiscovery.dao.AggregationSelection;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.dao.SortAnalyzer;
import fr.inra.urgi.datadiscovery.dao.rare.RareAggregation;
import fr.inra.urgi.datadiscovery.dao.rare.RareAggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import fr.inra.urgi.datadiscovery.domain.AggregatedPageImpl;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import fr.inra.urgi.datadiscovery.dto.AggregationDTO;
import fr.inra.urgi.datadiscovery.dto.BucketDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/**
 * MVC tests for {@link SearchController}
 */
@Import({SecurityConfig.class, RareAggregationAnalyzer.class})
@WebMvcTest(controllers = SearchController.class)
class SearchControllerTest {
    @MockitoSpyBean
    private RareAggregationAnalyzer rareAggregationAnalyzer;

    @MockitoBean
    private RareDocumentDao mockDocumentDao;

    @MockitoBean
    private SortAnalyzer mockSortAnalyzer;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldSearch() throws Exception {
        RareDocument resource = RareDocument.builder()
                                            .withId("CFBP 8402")
                                            .withName("CFBP 8402")
                                            .withDescription("Xylella fastidiosa subsp. Pauca, risk group = Quarantine")
                                            .build();

        Sort sort = Sort.by(Sort.Direction.DESC, "name.keyword");
        when(mockSortAnalyzer.createSort("name", "desc")).thenReturn(sort);

        PageRequest pageRequest = PageRequest.of(0, SearchController.PAGE_SIZE, sort);
        String query = "pauca";
        when(mockDocumentDao.search(query, false, false, SearchRefinements.EMPTY, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Arrays.asList(resource), pageRequest, 1));

        mockMvc.perform(get("/api/search")
                            .param("query", query)
                            .param("descendants", "false")
                            .param("sort", "name")
                            .param("direction", "desc"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.number").value(0))
               .andExpect(jsonPath("$.maxResults").value(SearchController.MAX_RESULTS))
               .andExpect(jsonPath("$.content[0].identifier").value(resource.getId()))
               .andExpect(jsonPath("$.content[0].name").value(resource.getName()))
               .andExpect(jsonPath("$.content[0].description").value(resource.getDescription()));
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

        List<AggregationDTO> aggregations = new ArrayList<>();
        AggregationDTO domain = new AggregationDTO(
            RareAggregation.DOMAIN.getName(),
            RareAggregation.DOMAIN.getType(),
            List.of(
                new BucketDTO("Plantae", 123),
                new BucketDTO("Fungi", 2)
            )
        );
        aggregations.add(domain);
        for (RareAggregation rareAggregation : RareAggregation.values()) {
            if (rareAggregation != RareAggregation.DOMAIN) {
                aggregations.add(new AggregationDTO(rareAggregation.getName(),
                                                    rareAggregation.getType(),
                                                    Collections.emptyList()));
            }
        }

        when(mockDocumentDao.aggregate(query, SearchRefinements.EMPTY, AggregationSelection.ALL, false))
            .thenReturn(
                new AggregatedPageImpl<>(
                    List.of(resource),
                    pageRequest,
                    1,
                    aggregations
                )
            );

        ResultActions resultActions =
            mockMvc.perform(get("/api/aggregate")
                                .param("query", query)
                                .param("aggregate", "true")
                                .param("descendants", "false"))
                   .andExpect(status().isOk())
                   .andExpect(jsonPath("$").isArray())
                   .andExpect(jsonPath("$[0].name").value(RareAggregation.DOMAIN.getName()))
                   .andExpect(jsonPath("$[0].buckets").isArray())
                   .andExpect(jsonPath("$[0].buckets[0].key").value("Plantae"))
                   .andExpect(jsonPath("$[0].buckets[0].documentCount").value(123))
                   .andExpect(jsonPath("$[0].buckets[1].key").value("Fungi"))
                   .andExpect(jsonPath("$[0].buckets[1].documentCount").value(2))
                   .andExpect(jsonPath("$[0].type").value(RareAggregation.Type.LARGE.toString()));

        // check that the aggregations are sorted in the order of the enum
        for (int i = 0; i < RareAggregation.values().length; i++) {
            resultActions.andExpect(jsonPath("$[" + i + "].name")
                                        .value(RareAggregation.values()[i].getName()));
        }
    }

    @Test
    void shouldSearchWithRefinements() throws Exception {
        PageRequest pageRequest = PageRequest.of(1, SearchController.PAGE_SIZE);
        String query = "pauca";

        when(mockSortAnalyzer.createSort(null, null)).thenReturn(Sort.unsorted());

        SearchRefinements expectedRefinements =
            SearchRefinements.builder()
                             .withTerm(RareAggregation.DOMAIN, Arrays.asList("d1"))
                             .withTerm(RareAggregation.BIOTOPE, Arrays.asList("b1", "b2"))
                             .withTerm(RareAggregation.MATERIAL, Arrays.asList("m1"))
                             .build();

        when(mockDocumentDao.search(query, false, false, expectedRefinements, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Collections.emptyList(), pageRequest, 1));

        mockMvc.perform(get("/api/search")
                            .param("query", query)
                            .param("page", "1")
                            .param("descendants", "false")
                            .param(RareAggregation.DOMAIN.getName(), "d1")
                            .param(RareAggregation.BIOTOPE.getName(), "b2", "b1")
                            .param(RareAggregation.MATERIAL.getName(), "m1"))
               .andExpect(status().isOk());
    }

    @Test
    void shouldThrowIfPageTooLarge() throws Exception {
        int page = SearchController.MAX_RESULTS / SearchController.PAGE_SIZE;
        String query = "pauca";

        when(mockSortAnalyzer.createSort(null, null)).thenReturn(Sort.unsorted());

        mockMvc.perform(get("/api/search")
                            .param("query", query)
                            .param("page", Integer.toString(page))
                            .param("descendants", "false"))
               .andExpect(status().isBadRequest());
    }
}
