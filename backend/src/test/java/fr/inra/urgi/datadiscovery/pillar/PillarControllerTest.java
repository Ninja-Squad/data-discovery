package fr.inra.urgi.datadiscovery.pillar;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import fr.inra.urgi.datadiscovery.config.SecurityConfig;
import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import org.hamcrest.CoreMatchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Unit tests for {@link PillarController}
 *
 * @author JB Nizet
 */
@Import(SecurityConfig.class)
@WebMvcTest(controllers = PillarController.class)
class PillarControllerTest {

    @MockitoBean
    private RareDocumentDao mockDocumentDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldListPillars() throws Exception {
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

        mockMvc.perform(get("/api/pillars"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$").isArray())
               .andExpect(jsonPath("$[0].name").value("Plant"))
               .andExpect(jsonPath("$[0].documentCount").value(1000))
               .andExpect(jsonPath("$[0].databaseSources").isArray())
               .andExpect(jsonPath("$[0].databaseSources[0].name").value("Florilège"))
               .andExpect(jsonPath("$[0].databaseSources[0].documentCount").value(800))
               .andExpect(jsonPath("$[0].databaseSources[0].url")
                              .value("http://florilege.arcad-project.org/fr/collections"))
               .andExpect(jsonPath("$[0].databaseSources[1].name").value("CNRGV"))
               .andExpect(jsonPath("$[0].databaseSources[1].documentCount").value(200))
               .andExpect(jsonPath("$[0].databaseSources[1].url")
                              .value("https://cnrgv.toulouse.inrae.fr/library/genomic_resource/ Aha-B-H25"))
               .andExpect(jsonPath("$[1].name").value("Forest"))
               .andExpect(jsonPath("$[1].documentCount").value(500))
               .andExpect(jsonPath("$[1].databaseSources").isArray())
               .andExpect(jsonPath("$[1].databaseSources[0].name").value("GnpIS"))
               .andExpect(jsonPath("$[1].databaseSources[0].documentCount").value(500))
               .andExpect(jsonPath("$[1].databaseSources[0].url").value(CoreMatchers.nullValue()));
    }
}
