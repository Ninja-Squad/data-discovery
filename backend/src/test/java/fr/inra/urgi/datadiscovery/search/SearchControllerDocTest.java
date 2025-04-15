package fr.inra.urgi.datadiscovery.search;

import static fr.inra.urgi.datadiscovery.doc.DocUtils.docGet;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.*;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.queryParameters;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.datadiscovery.dao.AggregationSelection;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.dao.rare.RareAggregation;
import fr.inra.urgi.datadiscovery.dao.rare.RareAggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import fr.inra.urgi.datadiscovery.dao.rare.RareSortAnalyzer;
import fr.inra.urgi.datadiscovery.doc.DocumentationConfig;
import fr.inra.urgi.datadiscovery.domain.AggregatedPageImpl;
import fr.inra.urgi.datadiscovery.domain.GeographicLocationDocument;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import fr.inra.urgi.datadiscovery.dto.AggregationDTO;
import fr.inra.urgi.datadiscovery.dto.BucketDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.restdocs.request.ParameterDescriptor;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * REST-Docs tests for {@link SearchController}
 */
@WebMvcTest(controllers = SearchController.class)
@Import({DocumentationConfig.class, RareAggregationAnalyzer.class, RareSortAnalyzer.class})
@AutoConfigureRestDocs
class SearchControllerDocTest {

    @MockitoSpyBean
    private RareAggregationAnalyzer rareAggregationAnalyzer;

    @MockitoSpyBean
    private RareSortAnalyzer rareSortAnalyzer;

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
    private static final ParameterDescriptor DESCENDANTS_PARAM =
        parameterWithName("descendants")
            .description("If true, a query searching in the children of the node (of an ontology, ie. GO) is launched and the results are returned.");
    private static final ParameterDescriptor MAIN_PARAM =
            parameterWithName("main")
                    .description("If present and set to true, only the main aggregations are returned. This is used to only display some aggregations on the home page");

    @MockitoBean
    private RareDocumentDao mockDocumentDao;

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
                               "https://urgi.versailles.inrae.fr/faidare/#accessionCard/id=ZG9pOjEwLjE1NDU0LzEuNDkyMTc4NTI5NzIyNzYwN0UxMg==")
                               .withAccessionHolder("AH1")
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
                               "https://urgi.versailles.inrae.fr/faidare/#accessionCard/id=ZG9pOjEwLjE1NDU0LzEuNDkyMTc4NTM1MTUxNjk4RTEy")
                               .withAccessionHolder("AH1")
                               .withDomain("Plantae")
                               .withTaxon(Collections.singletonList("Vitis vinifera"))
                               .withFamily(Collections.singletonList("Vitaceae"))
                               .withGenus(Collections.singletonList("Vitis"))
                               .withSpecies(Collections.singletonList("Vitis vinifera"))
                               .withCountryOfCollect("Italy")
                               .withLocationOfCollect(new GeographicLocationDocument("3","SiteName", "Collecting site", 37.5, 15.099722))
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

        when(mockDocumentDao.search(query, false, false, SearchRefinements.EMPTY, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Arrays.asList(syrah, dorato), pageRequest, 2));

        mockMvc.perform(docGet("/api/search").param("query", query).param("descendants", "false"))
               .andExpect(status().isOk())
               .andDo(document("search/fulltext",
                               queryParameters(
                                       QUERY_PARAM,
                                       DESCENDANTS_PARAM
                               ),
                               responseFields(
                                   fieldWithPath("number").description("The number of the page, starting at 0"),
                                   fieldWithPath("size").description("The size of the page"),
                                   fieldWithPath("totalElements").description("The total number of documents found"),
                                   fieldWithPath("maxResults").description("The limit in terms of number of documents that you can navigate to. For example, if the page size is 20, and the total number of elements is 11000, you won't be able to navigate to the last 1000 elements"),
                                   fieldWithPath("totalPages").description("The total number of pages of documents that you can navigate to"),
                                   fieldWithPath("content").description("The array of documents contained in the requested page"),
                                   subsectionWithPath("content[]").ignored())));
    }

    @Test
    void shouldGetSpecificPage() throws Exception {
        int page = 253;
        PageRequest pageRequest = PageRequest.of(page, SearchController.PAGE_SIZE);
        String query = "vitis";

        when(mockDocumentDao.search(query, false, false, SearchRefinements.EMPTY, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Arrays.asList(syrah, dorato), pageRequest, SearchController.PAGE_SIZE * page + 2));

        mockMvc.perform(docGet("/api/search")
                            .param("query", query)
                            .param("page", Integer.toString(page)))
               .andExpect(status().isOk())
               .andDo(document("search/page",
                               queryParameters(QUERY_PARAM, PAGE_PARAM)));
    }

    @Test
    void shouldHighlight() throws Exception {
        PageRequest pageRequest = PageRequest.of(0, SearchController.PAGE_SIZE);
        String query = "vitis";

        when(mockDocumentDao.search(query, true, false, SearchRefinements.EMPTY, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Arrays.asList(highlightedSyrah, highlightedDorato), pageRequest, 2));

        mockMvc.perform(docGet("/api/search")
                            .param("query", query)
                            .param("highlight", "true"))
               .andExpect(status().isOk())
               .andDo(document("search/highlight",
                               queryParameters(QUERY_PARAM, HIGHLIGHT_PARAM)));
    }

    @Test
    void shouldAggregate() throws Exception {
        String query = "vitis";

        when(mockDocumentDao.aggregate(query, SearchRefinements.EMPTY, AggregationSelection.ALL, false))
            .thenReturn(new AggregatedPageImpl<>(
                List.of(),
                PageRequest.of(0, 1),
                34567,
                List.of(
                    new AggregationDTO(
                        RareAggregation.DOMAIN.getName(),
                        RareAggregation.DOMAIN.getType(),
                        List.of(
                            new BucketDTO("Plantae", 25),
                            new BucketDTO("FUNGI", 2)
                        )
                    ),
                    new AggregationDTO(
                        RareAggregation.BIOTOPE.getName(),
                        RareAggregation.BIOTOPE.getType(),
                        List.of()
                    ),
                    new AggregationDTO(
                        RareAggregation.MATERIAL.getName(),
                        RareAggregation.MATERIAL.getType(),
                        List.of(
                            new  BucketDTO("Genome library", 4)
                        )
                    ),
                    new AggregationDTO(
                        RareAggregation.COUNTRY_OF_ORIGIN.getName(),
                        RareAggregation.COUNTRY_OF_ORIGIN.getType(),
                        List.of(
                            new BucketDTO("France", 2431),
                            new BucketDTO("Italy", 376)
                        )
                    ),
                    new AggregationDTO(
                        RareAggregation.TAXON.getName(),
                        RareAggregation.TAXON.getType(),
                        List.of(
                            new BucketDTO("Vitis vinifera", 4563),
                            new BucketDTO("Vitis x interspécifique", 285)
                        )
                    )
                )
            ));

        mockMvc.perform(docGet("/api/aggregate").param("query", query).param("main", "false"))
               .andExpect(status().isOk())
               .andDo(document("search/aggregate",
                               queryParameters(QUERY_PARAM, MAIN_PARAM),
                               responseFields(
                                   fieldWithPath("[].name").description("The name of the aggregation, used as a request parameter to apply a filter for this aggregation (see later)"),
                                   fieldWithPath("[].type")
                                       .type(Stream.of(RareAggregation.Type.values()).map(type -> "\"" + type.name() + "\"").collect(
                                           Collectors.joining(" or ")))
                                       .description("The type of the aggregation, used to decide if it should be displayed using checkboxes or using a typeahead input field"),
                                   fieldWithPath("[].buckets").description("The buckets for this aggregation. A bucket exists for each distinct value of the property"),
                                   fieldWithPath("[].buckets[].key").description("One of the distinct values of the property"),
                                   fieldWithPath("[].buckets[].documentCount").description("The number of documents matched by the full-text search which fall into the bucket, i.e. have this distinct value for the property"))));
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

        when(mockDocumentDao.search(query, false, false, expectedRefinements, pageRequest))
            .thenReturn(new AggregatedPageImpl<>(Collections.emptyList(), pageRequest, 1));

        mockMvc.perform(docGet("/api/search")
                            .param("query", query)
                            .param(RareAggregation.DOMAIN.getName(), "Plantae")
                            .param(RareAggregation.COUNTRY_OF_ORIGIN.getName(), "France", "Italy"))
               .andExpect(status().isOk())
               .andDo(document("search/filter",
                               queryParameters(
                                   QUERY_PARAM,
                                   parameterWithName(RareAggregation.DOMAIN.getName()).description("The accepted values for the " + RareAggregation.DOMAIN.getName() + " aggregation's corresponding property (`domain`)"),
                                   parameterWithName(RareAggregation.COUNTRY_OF_ORIGIN.getName()).description("The accepted values for the " + RareAggregation.COUNTRY_OF_ORIGIN.getName() + " aggregation's corresponding property (`countryOfOrigin`)"))));
    }
}
