package fr.inra.urgi.datadiscovery.ontology;

import static fr.inra.urgi.datadiscovery.ontology.OntologyService.DEFAULT_LANGUAGE;
import static fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType.ONTOLOGY;
import static fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType.TRAIT_CLASS;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.SecurityConfig;
import fr.inra.urgi.datadiscovery.ontology.api.Ontology;
import fr.inra.urgi.datadiscovery.ontology.api.Trait;
import fr.inra.urgi.datadiscovery.ontology.api.Variable;
import fr.inra.urgi.datadiscovery.ontology.state.OntologyDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TraitClassDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TraitDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TreeI18n;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNode;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNodePayload;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType;
import fr.inra.urgi.datadiscovery.ontology.state.VariableDetails;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * MVC tests for {@link OntologyController}
 *
 * @author JB Nizet
 */
@Import(SecurityConfig.class)
@WebMvcTest(OntologyController.class)
@ActiveProfiles(AppProfile.FAIDARE)
class OntologyControllerTest {
    @MockitoBean
    private OntologyService mockOntologyService;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldGetTree() throws Exception {
        when(mockOntologyService.getTree()).thenReturn(
            Arrays.asList(
                new TreeNode(
                    new TreeNodePayload(ONTOLOGY, "o1"),
                    Arrays.asList(
                        new TreeNode(
                            new TreeNodePayload(TRAIT_CLASS, "tc1"),
                            Collections.emptyList()
                        )
                    )
                )
            )
        );

        mockMvc.perform(get("/api/ontologies"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].payload.id").value("o1"))
            .andExpect(jsonPath("$[0].payload.type").value("ONTOLOGY"))
            .andExpect(jsonPath("$[0].children.length()").value(1))
            .andExpect(jsonPath("$[0].children[0].payload.id").value("tc1"))
            .andExpect(jsonPath("$[0].children[0].payload.type").value("TRAIT_CLASS"));
    }

    @Test
    void shouldGetTreeI18n() throws Exception {
        Map<TreeNodeType, Map<String, String>> names = new HashMap<>();
        Map<String, String> ontologyMap = new HashMap<>();
        ontologyMap.put("o1", "Ontology 1");
        names.put(ONTOLOGY, ontologyMap);
        Map<String, String> traitClassMap = new HashMap<>();
        traitClassMap.put("tc1", "Trait Class 1");
        names.put(TRAIT_CLASS, traitClassMap);

        TreeI18n treeI18n = new TreeI18n("FR", names);
        when(mockOntologyService.getTreeI18n("FR")).thenReturn(treeI18n);

        mockMvc.perform(get("/api/ontologies/i18n").param("language", "FR"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.language").value("FR"))
               .andExpect(jsonPath("$.names.ONTOLOGY.o1").value("Ontology 1"))
               .andExpect(jsonPath("$.names.TRAIT_CLASS.tc1").value("Trait Class 1"));
    }

    @Test
    void shouldGetOntology() throws Exception {
        when(mockOntologyService.getOntology("foo", "ES")).thenReturn(
            Optional.of(new OntologyDetails(Ontology.builder().withOntologyDbId("foo").withOntologyName("Foo").build()))
        );

        mockMvc.perform(get("/api/ontologies/foo").param("language", "ES"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.ontologyDbId").value("foo"))
               .andExpect(jsonPath("$.ontologyName").value("Foo"));
    }

    @Test
    void shouldGetTraitClass() throws Exception {
        when(mockOntologyService.getTraitClass("foo", "FR")).thenReturn(
            Optional.of(new TraitClassDetails("foo", "Foo", "Bla"))
        );

        mockMvc.perform(get("/api/ontologies/trait-classes/foo").param("language", "FR"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value("foo"))
               .andExpect(jsonPath("$.name").value("Foo"))
               .andExpect(jsonPath("$.ontologyName").value("Bla"));
    }

    @Test
    void shouldGetTrait() throws Exception {
        when(mockOntologyService.getTrait("foo", DEFAULT_LANGUAGE)).thenReturn(
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
        when(mockOntologyService.getVariable("foo", DEFAULT_LANGUAGE)).thenReturn(
            Optional.of(new VariableDetails(Variable.builder().withObservationVariableDbId("foo").withName("Foo").build()))
        );

        mockMvc.perform(get("/api/ontologies/variables/foo"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.observationVariableDbId").value("foo"))
               .andExpect(jsonPath("$.name").value("Foo"));
    }
}
