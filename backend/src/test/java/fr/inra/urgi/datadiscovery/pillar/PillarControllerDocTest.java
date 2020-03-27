package fr.inra.urgi.datadiscovery.pillar;

import java.util.Arrays;
import java.util.Collections;

import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import fr.inra.urgi.datadiscovery.doc.DocumentationConfig;
import fr.inra.urgi.datadiscovery.search.MockBucket;
import fr.inra.urgi.datadiscovery.search.MockTermsAggregation;
import org.elasticsearch.search.aggregations.Aggregations;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.restdocs.RestDocumentationExtension;
import org.springframework.restdocs.payload.JsonFieldType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import static fr.inra.urgi.datadiscovery.doc.DocUtils.docGet;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REST-Docs tests for {@link PillarController}
 * @author JB Nizet
 */
@ExtendWith({SpringExtension.class, RestDocumentationExtension.class})
@Import(DocumentationConfig.class)
@WebMvcTest(controllers = PillarController.class, secure = false)
@AutoConfigureRestDocs
class PillarControllerDocTest {

    @MockBean
    private RareDocumentDao mockDocumentDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldList() throws Exception {
        Terms pillarTerms = new MockTermsAggregation("pillar", Arrays.asList(
            new MockBucket("Plant", 999, new Aggregations(Arrays.asList( // wrong approximate count
                new MockTermsAggregation(RareDocumentDao.DATABASE_SOURCE_AGGREGATION_NAME, Arrays.asList(
                    new MockBucket("Florilège", 800, new Aggregations(Arrays.asList(
                        new MockTermsAggregation(RareDocumentDao.PORTAL_URL_AGGREGATION_NAME, Collections.singletonList(
                            new MockBucket("http://florilege.arcad-project.org/fr/collections", 800)
                        ))
                    ))),
                    new MockBucket("CNRGV", 200, new Aggregations(Arrays.asList(
                        new MockTermsAggregation(RareDocumentDao.PORTAL_URL_AGGREGATION_NAME, Arrays.asList(
                            new MockBucket("https://cnrgv.toulouse.inrae.fr/library/genomic_resource/ Aha-B-H25", 800)
                        ))
                    )))
                ))
            ))),
            new MockBucket("Forest", 500, new Aggregations(Arrays.asList(
                new MockTermsAggregation(RareDocumentDao.DATABASE_SOURCE_AGGREGATION_NAME, Arrays.asList(
                    new MockBucket("GnpIS", 500, new Aggregations(Arrays.asList(
                        new MockTermsAggregation(RareDocumentDao.PORTAL_URL_AGGREGATION_NAME, Collections.emptyList())// no URL
                    )))
                ))
            )))
        ));
        when(mockDocumentDao.findPillars()).thenReturn(pillarTerms);

        mockMvc.perform(docGet("/api/pillars"))
               .andExpect(status().isOk())
               .andDo(document("pillars/list",
                               responseFields(
                                   fieldWithPath("[]").description("The array of pillars"),
                                   fieldWithPath("[].name").description("The pillar name"),
                                   fieldWithPath("[].documentCount").description("The total number of document (resources) for the pillar"),
                                   fieldWithPath("[].databaseSources").description("The database sources of the pillar"),
                                   fieldWithPath("[].databaseSources[].name").description("The name of the database source"),
                                   fieldWithPath("[].databaseSources[].documentCount").description("The number of documents (resources) of the database source"),
                                   fieldWithPath("[].databaseSources[].url")
                                       .type(JsonFieldType.STRING)
                                       .optional()
                                       .description("The URL of the database source. Null if no URL was found for the database source. If several different URLs were found for the same database source (which indicates a problem in the data), then the URL of the one with the largest number of documents is used")
                               )));
    }
}
