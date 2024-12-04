package fr.inra.urgi.datadiscovery;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;

import java.util.Collections;
import java.util.Comparator;

import fr.inra.urgi.datadiscovery.config.SecurityConfig;
import fr.inra.urgi.datadiscovery.dao.AggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import fr.inra.urgi.datadiscovery.dao.rare.RareSortAnalyzer;
import fr.inra.urgi.datadiscovery.domain.AggregatedPageImpl;
import fr.inra.urgi.datadiscovery.dto.AggregationDTO;
import fr.inra.urgi.datadiscovery.search.SearchController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Unit tests for {@link IndexFilter}
 *
 * @author JB Nizet
 */
@WebMvcTest(controllers = SearchController.class)
@Import({SecurityConfig.class, RareSortAnalyzer.class})
class IndexFilterTest {
    @MockitoSpyBean
    private RareSortAnalyzer rareSortAnalyzer;

    @MockitoBean
    private RareDocumentDao mockDocumentDao;

    @MockitoBean
    private AggregationAnalyzer mockAggregationAnalyzer;

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void prepare() {
        when(mockDocumentDao.search(any(), anyBoolean(), anyBoolean(), any(), any())).thenReturn(new AggregatedPageImpl<>(
                Collections.emptyList(),
                PageRequest.of(0, 20),
                0
        ));
        when(mockAggregationAnalyzer.comparator()).thenReturn(Comparator.comparing(AggregationDTO::getName));
    }

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
        "/api/search",
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

    @Test
    void shouldCorrectlyHandleContextPath() throws Exception {
        mockMvc.perform(get("/rare/api/search").contextPath("/rare"))
               .andExpect(forwardedUrl(null));
        mockMvc.perform(get("/rare/search?query=vitis").contextPath("/rare"))
               .andExpect(forwardedUrl("/index.html"));
    }
}
