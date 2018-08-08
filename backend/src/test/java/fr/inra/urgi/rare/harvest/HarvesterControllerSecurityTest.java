package fr.inra.urgi.rare.harvest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fr.inra.urgi.rare.config.SecurityConfig;
import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.dao.HarvestResultDao;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Tests that security is active for {@link HarvesterController}
 * @author JB Nizet
 */
@ExtendWith(SpringExtension.class)
@Import(SecurityConfig.class)
@WebMvcTest(controllers = HarvesterController.class)
class HarvesterControllerSecurityTest {

    @MockBean
    private AsyncHarvester mockAsyncHarvester;

    @MockBean
    private HarvestResultDao mockHarvestResultDao;

    @MockBean
    private GeneticResourceDao mockGeneticResourceDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldBeUnauthorizedWhenGetting() throws Exception {
        HarvestResult harvestResult = HarvestResult.builder().build();

        mockMvc.perform(get("/api/harvests/{id}", harvestResult.getId()))
               .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldBeUnauthorizedWhenCreating() throws Exception {
        mockMvc.perform(post("/api/harvests"))
               .andExpect(status().isUnauthorized());
    }
}
