package fr.inra.urgi.datadiscovery.pillar;

import static fr.inra.urgi.datadiscovery.doc.DocUtils.docGet;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import fr.inra.urgi.datadiscovery.doc.DocumentationConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restdocs.test.autoconfigure.AutoConfigureRestDocs;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.restdocs.payload.JsonFieldType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * REST-Docs tests for {@link PillarController}
 *
 * @author JB Nizet
 */
@Import(DocumentationConfig.class)
@WebMvcTest(controllers = PillarController.class)
@AutoConfigureRestDocs
class PillarControllerDocTest {

    @MockitoBean
    private RareDocumentDao mockDocumentDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldList() throws Exception {
        List<PillarDTO> pillars = List.of(
            new PillarDTO(
                "Plant",
                List.of(
                    new DatabaseSourceDTO("Florilège", "http://florilege.arcad-project.org/fr/collections", 800),
                    new DatabaseSourceDTO("CNRGV", "https://cnrgv.toulouse.inrae.fr/library/genomic_resource/ Aha-B-H25", 200)
                )
            ),
            new PillarDTO(
                "Forest",
                List.of(
                    new DatabaseSourceDTO("GnpIS", null, 500)
                )
            )
        );
        when(mockDocumentDao.findPillars()).thenReturn(pillars);

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
