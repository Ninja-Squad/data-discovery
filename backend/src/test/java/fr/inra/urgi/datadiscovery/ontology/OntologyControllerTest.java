package fr.inra.urgi.datadiscovery.ontology;

import static fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType.ONTOLOGY;
import static fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType.TRAIT_CLASS;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.SecurityConfig;
import fr.inra.urgi.datadiscovery.ontology.api.Ontology;
import fr.inra.urgi.datadiscovery.ontology.api.Trait;
import fr.inra.urgi.datadiscovery.ontology.api.Variable;
import fr.inra.urgi.datadiscovery.ontology.state.OntologyDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TraitClassDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TraitDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNode;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNodePayload;
import fr.inra.urgi.datadiscovery.ontology.state.VariableDetails;
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

    @Test
    void shouldGetOntology() throws Exception {
        when(mockOntologyService.getOntology("foo")).thenReturn(
            Optional.of(new OntologyDetails(Ontology.builder().withOntologyDbId("foo").withOntologyName("Foo").build()))
        );

        mockMvc.perform(get("/api/ontologies/foo"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.ontologyDbId").value("foo"))
               .andExpect(jsonPath("$.ontologyName").value("Foo"));
    }

    @Test
    void shouldGetTraitClass() throws Exception {
        when(mockOntologyService.getTraitClass("foo")).thenReturn(
            Optional.of(new TraitClassDetails("foo", "Foo", "Bla"))
        );

        mockMvc.perform(get("/api/ontologies/trait-classes/foo"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value("foo"))
               .andExpect(jsonPath("$.name").value("Foo"))
               .andExpect(jsonPath("$.ontologyName").value("Bla"));
    }

    @Test
    void shouldGetTrait() throws Exception {
        when(mockOntologyService.getTrait("foo")).thenReturn(
            Optional.of(new TraitDetails(Trait.builder().withTraitDbId("foo").withName("Foo").build(), "Some ontology name"))
        );

        mockMvc.perform(get("/api/ontologies/traits/foo"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.traitDbId").value("foo"))
               .andExpect(jsonPath("$.name").value("Foo"))
               .andExpect(jsonPath("$.ontologyName").value("Some ontology name"))
        ;
    }

    @Test
    void shouldGetVariable() throws Exception {
        when(mockOntologyService.getVariable("foo")).thenReturn(
            Optional.of(new VariableDetails(Variable.builder().withObservationVariableDbId("foo").withName("Foo").build()))
        );

        mockMvc.perform(get("/api/ontologies/variables/foo"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.observationVariableDbId").value("foo"))
               .andExpect(jsonPath("$.name").value("Foo"));
    }
}
