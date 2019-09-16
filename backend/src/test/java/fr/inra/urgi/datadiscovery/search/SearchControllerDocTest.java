package fr.inra.urgi.datadiscovery.search;

import java.util.Arrays;
import java.util.Collections;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.dao.rare.RareAggregation;
import fr.inra.urgi.datadiscovery.dao.rare.RareAggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import fr.inra.urgi.datadiscovery.doc.DocumentationConfig;
import fr.inra.urgi.datadiscovery.domain.Location;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import org.elasticsearch.search.aggregations.Aggregations;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.aggregation.impl.AggregatedPageImpl;
import org.springframework.restdocs.request.ParameterDescriptor;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import static fr.inra.urgi.datadiscovery.doc.DocUtils.docGet;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.payload.PayloadDocumentation.subsectionWithPath;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.requestParameters;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REST-Docs tests for {@link SearchController}
 */
@ExtendWith(SpringExtension.class)
@WebMvcTest(controllers = SearchController.class, secure = false)
@Import(DocumentationConfig.class)
@AutoConfigureRestDocs
class SearchControllerDocTest {

    private static final ParameterDescriptor QUERY_PARAM =
        parameterWithName("query")
            .description("The full text query. It can contain several words.");
    private static final ParameterDescriptor PAGE_PARAM =
        parameterWithName("page")
            .description("The page number, starting at 0.");
    private static final ParameterDescriptor HIGHLIGHT_PARAM =
        parameterWithName("highlight")
            .description("If true, the description is highlighted.");
    private static final ParameterDescriptor AGGREGATE_PARAM =
        parameterWithName("aggregate")
            .description("If true, aggregations are computed and returned.");

    @MockBean
    private RareDocumentDao mockDocumentDao;

    @SpyBean
    private RareAggregationAnalyzer aggregationAnalyzer;

    @Autowired
    private MockMvc mockMvc;

    private RareDocument syrah;
    private RareDocument dorato;

    private RareDocument highlightedSyrah;
    private RareDocument highlightedDorato;

    @BeforeEach
    void prepare() {
        syrah =
            RareDocument.builder()
                               .withPillarName("Plant")
                               .withDatabaseSource("Florilège")
                               .withPortalURL("http://florilege.arcad-project.org/fr/collections")
                               .withId("doi:10.15454/1.4921785297227607E12")
                               .withName("Syrah")
                               .withDescription(
                               "Syrah is a Vitis vinifera subsp vinifera cv. Syrah accession (number: 150Mtp0, doi:10.15454/1.4921785297227607E12) maintained by the GRAPEVINE (managed by INRA) and held by INRA. It is a maintained/maintenu accession of biological status traditional cultivar/cultivar traditionnel. This accession has phenotyping data: Doligez_et_al_2013 - Study of the genetic determinism of berry weight and seed traits in a grapevine progeny.")
                               .withDataURL(
                               "https://urgi.versailles.inra.fr/gnpis-core/#accessionCard/id=ZG9pOjEwLjE1NDU0LzEuNDkyMTc4NTI5NzIyNzYwN0UxMg==")
                               .withDomain("Plantae")
                               .withTaxon(Collections.singletonList("Vitis vinifera"))
                               .withFamily(Collections.singletonList("Vitaceae"))
                               .withGenus(Collections.singletonList("Vitis"))
                               .withSpecies(Collections.singletonList("Vitis vinifera"))
                               .build();

        dorato =
            RareDocument.builder()
                               .withPillarName("Plant")
                               .withDatabaseSource("Florilège")
                               .withPortalURL("http://florilege.arcad-project.org/fr/collections")
                               .withId("doi:10.15454/1.492178535151698E12")
                               .withName("Grecanico dorato")
                               .withDescription(
                               "Grecanico dorato is a Vitis vinifera subsp vinifera cv. Garganega accession (number: 1310Mtp1, doi:10.15454/1.492178535151698E12) maintained by the GRAPEVINE (managed by INRA) and held by INRA. It is a maintained/maintenu accession of biological status traditional cultivar/cultivar traditionnel")
                               .withDataURL(
                               "https://urgi.versailles.inra.fr/gnpis-core/#accessionCard/id=ZG9pOjEwLjE1NDU0LzEuNDkyMTc4NTM1MTUxNjk4RTEy")
                               .withDomain("Plantae")
                               .withTaxon(Collections.singletonList("Vitis vinifera"))
                               .withFamily(Collections.singletonList("Vitaceae"))
                               .withGenus(Collections.singletonList("Vitis"))
                               .withSpecies(Collections.singletonList("Vitis vinifera"))
                               .withCountryOfCollect("Italy")
                               .withLocationOfCollect(new Location(37.5, 15.099722))
                               .build();

        highlightedSyrah =
            RareDocument.builder(syrah)
                               .withDescription(syrah.getDescription().replace("Vitis", "<em>Vitis</em>"))
                               .build();

        highlightedDorato =
            RareDocument.builder(dorato)
                               .withDescription(dorato.getDescription().replace("Vitis", "<em>Vitis</em>"))
                               .build();
    }

    @Test
    void shouldSearch() throws Exception {
        PageRequest pageRequest = PageRequest.of(0, SearchController.PAGE_SIZE);
        String query = "vitis";

        when(mockDocumentDao.search(query, false, SearchRefinements.EMPTY, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Arrays.asList(syrah, dorato), pageRequest, 2));

        mockMvc.perform(docGet("/api/documents").param("query", query))
               .andExpect(status().isOk())
               .andDo(document("search/fulltext",
                               requestParameters(QUERY_PARAM),
                               responseFields(
                                   fieldWithPath("number").description("The number of the page, starting at 0"),
                                   fieldWithPath("size").description("The size of the page"),
                                   fieldWithPath("totalElements").description("The total number of documents found"),
                                   fieldWithPath("maxResults").description("The limit in terms of number of documents that you can navigate to. For example, if the page size is 20, and the total number of elements is 11000, you won't be able to navigate to the last 1000 elements"),
                                   fieldWithPath("totalPages").description("The total number of pages of documents that you can navigate to"),
                                   fieldWithPath("content").description("The array of documents contained in the requested page"),
                                   subsectionWithPath("content[]").ignored(),
                                   fieldWithPath("aggregations").description("see the following section about aggregations"))));
    }

    @Test
    void shouldGetSpecificPage() throws Exception {
        int page = 253;
        PageRequest pageRequest = PageRequest.of(page, SearchController.PAGE_SIZE);
        String query = "vitis";

        when(mockDocumentDao.search(query, false, SearchRefinements.EMPTY, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Arrays.asList(syrah, dorato), pageRequest, SearchController.PAGE_SIZE * page + 2));

        mockMvc.perform(docGet("/api/documents")
                            .param("query", query)
                            .param("page", Integer.toString(page)))
               .andExpect(status().isOk())
               .andDo(document("search/page",
                               requestParameters(QUERY_PARAM, PAGE_PARAM)));
    }

    @Test
    void shouldHighlight() throws Exception {
        PageRequest pageRequest = PageRequest.of(0, SearchController.PAGE_SIZE);
        String query = "vitis";

        when(mockDocumentDao.search(query, true, SearchRefinements.EMPTY, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Arrays.asList(highlightedSyrah, highlightedDorato), pageRequest, 2));

        mockMvc.perform(docGet("/api/documents")
                            .param("query", query)
                            .param("highlight", "true"))
               .andExpect(status().isOk())
               .andDo(document("search/highlight",
                               requestParameters(QUERY_PARAM, HIGHLIGHT_PARAM)));
    }

    @Test
    void shouldSearchAndAggregate() throws Exception {
        int page = 253;
        PageRequest pageRequest = PageRequest.of(page, SearchController.PAGE_SIZE);
        String query = "vitis";

        when(mockDocumentDao.search(query, false, SearchRefinements.EMPTY, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(
                Arrays.asList(syrah, dorato),
                pageRequest,
                SearchController.PAGE_SIZE * page + 2,
                new Aggregations(
                    Arrays.asList(new MockTermsAggregation(RareAggregation.DOMAIN.getName(),
                                                           Arrays.asList(new MockBucket("Plantae", 123),
                                                                         new MockBucket("Fungi", 2))),
                                  new MockTermsAggregation(RareAggregation.BIOTOPE.getName(),
                                                           Collections.emptyList()),
                                  new MockTermsAggregation(RareAggregation.MATERIAL.getName(),
                                                           Collections.singletonList(new MockBucket("Genome library", 4))),
                                  new MockTermsAggregation(RareAggregation.COUNTRY_OF_ORIGIN.getName(),
                                                           Arrays.asList(new MockBucket("France", 2431),
                                                                         new MockBucket("Italy", 376))),
                                  new MockTermsAggregation(RareAggregation.TAXON.getName(),
                                                           Arrays.asList(new MockBucket("Vitis vinifera", 4563),
                                                                         new MockBucket("Vitis x interspécifique", 285)))
                    )
                )
            ));

        mockMvc.perform(docGet("/api/documents")
                            .param("query", query)
                            .param("page", Integer.toString(page))
                            .param("aggregate", "true"))
               .andExpect(status().isOk())
               .andDo(document("search/aggregate",
                               requestParameters(QUERY_PARAM, PAGE_PARAM, AGGREGATE_PARAM),
                               responseFields(
                                   fieldWithPath("number").ignored(),
                                   fieldWithPath("size").ignored(),
                                   fieldWithPath("totalElements").ignored(),
                                   fieldWithPath("maxResults").ignored(),
                                   fieldWithPath("totalPages").ignored(),
                                   fieldWithPath("content").ignored(),
                                   subsectionWithPath("content[]").ignored(),
                                   fieldWithPath("aggregations").description("The array of computed aggregations"),
                                   fieldWithPath("aggregations[].name").description("The name of the aggregation, used as a request parameter to apply a filter for this aggregation (see later)"),
                                   fieldWithPath("aggregations[].type")
                                       .type(Stream.of(RareAggregation.Type.values()).map(type -> "\"" + type.name() + "\"").collect(
                                           Collectors.joining(" or ")))
                                       .description("The type of the aggregation, used to decide if it should be displayed using checkboxes or using a typeahead input field"),
                                   fieldWithPath("aggregations[].buckets").description("The buckets for this aggregation. A bucket exists for each distinct value of the property"),
                                   fieldWithPath("aggregations[].buckets[].key").description("One of the distinct values of the property"),
                                   fieldWithPath("aggregations[].buckets[].documentCount").description("The number of documents matched by the full-text search which fall into the bucket, i.e. have this distinct value for the property"))));
    }

    @Test
    void shouldSearchWithRefinements() throws Exception {
        PageRequest pageRequest = PageRequest.of(0, SearchController.PAGE_SIZE);
        String query = "vitis";

        SearchRefinements expectedRefinements =
            SearchRefinements.builder()
                             .withTerm(RareAggregation.DOMAIN, Arrays.asList("Plantae"))
                             .withTerm(RareAggregation.COUNTRY_OF_ORIGIN, Arrays.asList("France", "Italy"))
                             .build();

        when(mockDocumentDao.search(query, false, expectedRefinements, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Collections.emptyList(), pageRequest, 1));

        mockMvc.perform(docGet("/api/documents")
                            .param("query", query)
                            .param(RareAggregation.DOMAIN.getName(), "Plantae")
                            .param(RareAggregation.COUNTRY_OF_ORIGIN.getName(), "France", "Italy"))
               .andExpect(status().isOk())
               .andDo(document("search/filter",
                               requestParameters(
                                   QUERY_PARAM,
                                   parameterWithName(RareAggregation.DOMAIN.getName()).description("The accepted values for the " + RareAggregation.DOMAIN.getName() + " aggregation's corresponding property (`domain`)"),
                                   parameterWithName(RareAggregation.COUNTRY_OF_ORIGIN.getName()).description("The accepted values for the " + RareAggregation.COUNTRY_OF_ORIGIN.getName() + " aggregation's corresponding property (`countryOfOrigin`)"))));
    }
}
