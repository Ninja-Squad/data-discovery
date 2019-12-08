package fr.inra.urgi.datadiscovery.search;

import java.util.Arrays;

import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import fr.inra.urgi.datadiscovery.doc.DocumentationConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import static fr.inra.urgi.datadiscovery.doc.DocUtils.docGet;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.requestParameters;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REST-Docs tests for {@link SuggestionController}
 * @author JB Nizet
 */
@ExtendWith(SpringExtension.class)
@Import(DocumentationConfig.class)
@WebMvcTest(controllers = SuggestionController.class, secure = false)
@AutoConfigureRestDocs
class SuggestionControllerDocTest {
    @MockBean
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
                               requestParameters(
                                   parameterWithName("query").description("The query to complete")
                               ),
                               responseFields(
                                   fieldWithPath("[]").description("The array of suggested completions")
                               )));
    }
}
