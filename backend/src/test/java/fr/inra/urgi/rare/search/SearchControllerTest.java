package fr.inra.urgi.rare.search;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import fr.inra.urgi.rare.config.SecurityConfig;
import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.domain.GeneticResourceBuilder;
import org.assertj.core.util.Lists;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.elasticsearch.core.query.SearchQuery;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

/**
 * MVC tests for {@link SearchController}
 */
@ExtendWith(SpringExtension.class)
@Import(SecurityConfig.class)
@WebMvcTest(controllers = SearchController.class)
class SearchControllerTest {

    @MockBean
    private GeneticResourceDao geneticResourceDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldSearch() throws Exception {
        GeneticResource resource = new GeneticResourceBuilder()
                .withId("CFBP 8402")
                .withName("CFBP 8402")
                .withDescription("Xylella fastidiosa subsp. Pauca, risk group = Quarantine")
                .build();
        List<GeneticResource> geneticResources = Lists.newArrayList(resource);
        Page<GeneticResource> searchResults = new PageImpl<>(geneticResources);
        when(geneticResourceDao.search(any(SearchQuery.class))).thenReturn(searchResults);

        mockMvc.perform(get("/api/genetic-resources?query=Bacteria"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].identifier").value(resource.getId()))
                .andExpect(jsonPath("$.content[0].name").value(resource.getName()));
    }
}
