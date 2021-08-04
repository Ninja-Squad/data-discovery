package fr.inra.urgi.datadiscovery.ontology;

import static fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType.ONTOLOGY;
import static fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType.TRAIT_CLASS;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.Collections;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.SecurityConfig;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNode;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNodePayload;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * MVC tests for {@link OntologyController}
 * @author JB Nizet
 */
@Import(SecurityConfig.class)
@WebMvcTest(OntologyController.class)
@ActiveProfiles(AppProfile.FAIDARE)
class OntologyControllerTest {
    @MockBean
    private OntologyService mockOntologyService;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldGetTree() throws Exception {
        when(mockOntologyService.getTree()).thenReturn(
            Arrays.asList(
                new TreeNode(
                    new TreeNodePayload(ONTOLOGY, "o1", "O1"),
                    Arrays.asList(
                        new TreeNode(
                            new TreeNodePayload(TRAIT_CLASS, "tc1", "TC1"),
                            Collections.emptyList()
                        )
                    )
                )
            )
        );

        mockMvc.perform(get("/api/ontologies"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].payload.id").value("o1"))
            .andExpect(jsonPath("$[0].payload.name").value("O1"))
            .andExpect(jsonPath("$[0].payload.type").value("ONTOLOGY"))
            .andExpect(jsonPath("$[0].children.length()").value(1))
            .andExpect(jsonPath("$[0].children[0].payload.id").value("tc1"))
            .andExpect(jsonPath("$[0].children[0].payload.name").value("TC1"))
            .andExpect(jsonPath("$[0].children[0].payload.type").value("TRAIT_CLASS"));
    }
}
