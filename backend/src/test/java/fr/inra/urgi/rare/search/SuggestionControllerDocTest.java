package fr.inra.urgi.rare.search;

import static fr.inra.urgi.rare.doc.DocUtils.docGet;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.requestParameters;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;

import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.doc.DocumentationConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

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
    private GeneticResourceDao mockGeneticResourceDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldSuggest() throws Exception {
        String query = "viti";
        when(mockGeneticResourceDao.suggest(query))
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

        mockMvc.perform(docGet("/api/genetic-resources-suggestions")
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
