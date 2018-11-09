package fr.inra.urgi.datadiscovery.search;

import java.util.Arrays;

import fr.inra.urgi.datadiscovery.config.SecurityConfig;
import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Unit tests for {@link SuggestionController}
 * @author JB Nizet
 */
@ExtendWith(SpringExtension.class)
@Import(SecurityConfig.class)
@WebMvcTest(controllers = SuggestionController.class)
class SuggestionControllerTest {
    @MockBean
    private RareDocumentDao mockDocumentDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldSuggest() throws Exception {
        String query = "viti";
        when(mockDocumentDao.suggest(query))
            .thenReturn((Arrays.asList("vitis", "vitis vinifera")));

        mockMvc.perform(get("/api/document-suggestions").param("query", query))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0]").value("vitis"))
               .andExpect(jsonPath("$[1]").value("vitis vinifera"));
    }
}
