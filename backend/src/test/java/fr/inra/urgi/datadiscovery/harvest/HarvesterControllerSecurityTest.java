package fr.inra.urgi.datadiscovery.harvest;

import fr.inra.urgi.datadiscovery.config.SecurityConfig;
import fr.inra.urgi.datadiscovery.dao.HarvestResultDao;
import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
    private RareDocumentDao mockDocumentDao;

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
