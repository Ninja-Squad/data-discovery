package fr.inra.urgi.datadiscovery.search;

import static fr.inra.urgi.datadiscovery.doc.DocUtils.docGet;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.queryParameters;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;

import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import fr.inra.urgi.datadiscovery.doc.DocumentationConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restdocs.test.autoconfigure.AutoConfigureRestDocs;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * REST-Docs tests for {@link SuggestionController}
 *
 * @author JB Nizet
 */
@Import(DocumentationConfig.class)
@WebMvcTest(controllers = SuggestionController.class)
@AutoConfigureRestDocs
class SuggestionControllerDocTest {
    @MockitoBean
    private RareDocumentDao mockDocumentDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldSuggest() throws Exception {
        String query = "viti";
        when(mockDocumentDao.suggest(query))
            .thenReturn(Arrays.asList("Viticulture",
                                      "Vitis",
                                      "Vitis Aestivalis",
                                      "Vitis amurensis",
                                      "Vitis arizonica",
                                      "Vitis armata",
                                      "Vitis berlandieri",
                                      "Vitis berlandieri 2 Macquin",
                                      "Vitis berlandieri Boutin A",
                                      "Vitis berlandieri Boutin B"));

        mockMvc.perform(docGet("/api/suggest")
                            .param("query", query))
               .andExpect(status().isOk())
               .andDo(document("suggestions/list",
                               queryParameters(
                                   parameterWithName("query").description("The query to complete")
                               ),
                               responseFields(
                                   fieldWithPath("[]").description("The array of suggested completions")
                               )));
    }
}
