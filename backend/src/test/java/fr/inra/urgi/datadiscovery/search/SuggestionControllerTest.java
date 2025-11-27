package fr.inra.urgi.datadiscovery.search;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;

import fr.inra.urgi.datadiscovery.config.SecurityConfig;
import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Unit tests for {@link SuggestionController}
 *
 * @author JB Nizet
 */
@Import(SecurityConfig.class)
@WebMvcTest(controllers = SuggestionController.class)
class SuggestionControllerTest {
    @MockitoBean
    private RareDocumentDao mockDocumentDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldSuggest() throws Exception {
        String query = "viti";
        when(mockDocumentDao.suggest(query))
            .thenReturn((Arrays.asList("vitis", "vitis vinifera")));

        mockMvc.perform(get("/api/suggest").param("query", query))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0]").value("vitis"))
               .andExpect(jsonPath("$[1]").value("vitis vinifera"));
    }
}
