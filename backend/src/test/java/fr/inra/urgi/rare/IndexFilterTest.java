package fr.inra.urgi.rare;

import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;

import fr.inra.urgi.rare.config.SecurityConfig;
import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.search.SearchController;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Unit tests for {@link IndexFilter}
 * @author JB Nizet
 */
@ExtendWith(SpringExtension.class)
@WebMvcTest(controllers = SearchController.class)
@Import(SecurityConfig.class)
class IndexFilterTest {
    @MockBean
    private GeneticResourceDao mockGeneticResourceDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldForwardToIndexForAngularUrl() throws Exception {
        mockMvc.perform(get("/search?query=vitis"))
               .andExpect(forwardedUrl("/index.html"));
    }

    @Test
    void shouldNotForwardToIndexWhenNotGet() throws Exception {
        mockMvc.perform(post("/search?query=vitis"))
               .andExpect(forwardedUrl(null));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "/index.html",
        "/script.js",
        "/style.css",
        "/image.gif",
        "/icon.ico",
        "/image.png",
        "/image.jpg",
        "/font.woff",
        "/font.ttf",
        "/actuator/info"
    })
    void shouldNotForwardToIndexWhenStaticResource(String url) throws Exception {
        mockMvc.perform(get(url)).andExpect(forwardedUrl(null));
    }
}
