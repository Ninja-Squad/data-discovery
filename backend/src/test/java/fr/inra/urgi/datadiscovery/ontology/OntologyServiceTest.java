package fr.inra.urgi.datadiscovery.ontology;

import static fr.inra.urgi.datadiscovery.ontology.OntologyService.DEFAULT_LANGUAGE;
import static fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import fr.inra.urgi.datadiscovery.ontology.api.Ontology;
import fr.inra.urgi.datadiscovery.ontology.api.Trait;
import fr.inra.urgi.datadiscovery.ontology.api.Variable;
import fr.inra.urgi.datadiscovery.ontology.state.TreeI18n;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNode;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNodePayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

/**
 * Unit tests for {@link OntologyService}
 * @author JB Nizet
 */
public class OntologyServiceTest {

    private OntologyClient mockOntologyClient;
    private TraitClassIdGenerator mockTraitClassIdGenerator;
    private OntologyService ontologyService;

    @BeforeEach
    void prepare() {
        mockOntologyClient = mock(OntologyClient.class);
        mockTraitClassIdGenerator = mock(TraitClassIdGenerator.class);

        when(mockTraitClassIdGenerator.generateId(any(), any())).thenAnswer(
            invocation -> (invocation.getArgument(0) + ":" + invocation.getArgument(1)).toLowerCase()
        );

        ontologyService = new OntologyService(mockOntologyClient, mockTraitClassIdGenerator);
    }

    @Test
    void shouldInitializeTheState() {
        Trait t1 = Trait.builder()
                        .withTraitDbId("t1")
                        .withName("T1")
                        .withTraitClass("TC1")
                        .build();
        Trait t2 = Trait.builder()
                        .withTraitDbId("t2")
                        .withName("T2")
                        .withTraitClass(null)
                        .build();
        Trait t3 = Trait.builder()
                        .withTraitDbId("t3")
                        .withName("T3")
                        .withTraitClass("TC3")
                        .build();
        Trait t4 = Trait.builder()
                        .withTraitDbId("t4")
                        .withName("T4")
                        .withTraitClass("TC3")
                        .build();
        Trait t3Fr = Trait.builder()
                        .withTraitDbId("t3")
                        .withName("T3-FR")
                        .withTraitClass("TC3")
                        .build();

        when(mockOntologyClient.getAllOntologies()).thenReturn(Mono.just(
           Arrays.asList(
               Ontology.builder().withOntologyDbId("o1").withOntologyName("O1").build(),
               Ontology.builder().withOntologyDbId("o2").withOntologyName("O2").build()
           )
        ));

        when(mockOntologyClient.getAllVariables()).thenReturn(Mono.just(
            Arrays.asList(
                Variable.builder()
                        .withObservationVariableDbId("v1")
                        .withName("V1")
                        .withOntologyDbId("o2")
                        .withOntologyName("O2")
                        .withTrait(t1)
                        .build(),
                Variable.builder()
                        .withObservationVariableDbId("v2")
                        .withName("V2")
                        .withOntologyDbId("o2")
                        .withOntologyName("O2")
                        .withTrait(t1)
                        .build(),
                Variable.builder()
                        .withObservationVariableDbId("v3")
                        .withName("V3")
                        .withOntologyDbId("o2")
                        .withOntologyName("O2")
                        .withTrait(t2)
                        .build(),
                Variable.builder()
                        .withObservationVariableDbId("v4")
                        .withName("V4")
                        .withOntologyDbId("o2")
                        .withOntologyName("O2")
                        .withTrait(t2)
                        .build(),
                Variable.builder()
                        .withObservationVariableDbId("v5")
                        .withName("V5")
                        .withOntologyDbId("o1")
                        .withOntologyName("O1")
                        .withTrait(t4)
                        .build(),
                Variable.builder()
                        .withObservationVariableDbId("v6")
                        .withName("V6")
                        .withOntologyDbId("o1")
                        .withOntologyName("O1")
                        .withTrait(t4)
                        .build(),
                Variable.builder()
                        .withObservationVariableDbId("v7")
                        .withName("V7")
                        .withLanguage("FR") // V7 only exists in French
                        .withOntologyDbId("o1")
                        .withOntologyName("O1")
                        .withTrait(t3)
                        .build(),
                Variable.builder()
                        .withObservationVariableDbId("v8")
                        .withName("V8")
                        .withOntologyDbId("o1")
                        .withOntologyName("O1")
                        .withTrait(t3)
                        .build(),
                Variable.builder()
                        .withObservationVariableDbId("v8")
                        .withName("V8-FR") // V8 exists in English and in French
                        .withLanguage("FR")
                        .withOntologyDbId("o1")
                        .withOntologyName("O1")
                        .withTrait(t3Fr)
                        .build()
            )
        ));

        ontologyService.run();
        List<TreeNode> tree = ontologyService.getTree();
        assertThat(tree).containsExactly(
            new TreeNode(
                new TreeNodePayload(ONTOLOGY, "o1"),
                Arrays.asList(
                    new TreeNode(
                        new TreeNodePayload(TRAIT_CLASS, "o1:tc3"),
                        Arrays.asList(
                            new TreeNode(
                                new TreeNodePayload(TRAIT, "t3"),
                                Arrays.asList(
                                    new TreeNode(
                                        new TreeNodePayload(VARIABLE, "v7"),
                                        Collections.emptyList()
                                    ),
                                    new TreeNode(
                                        new TreeNodePayload(VARIABLE, "v8"),
                                        Collections.emptyList()
                                    )
                                )
                            ),
                            new TreeNode(
                                new TreeNodePayload(TRAIT, "t4"),
                                Arrays.asList(
                                    new TreeNode(
                                        new TreeNodePayload(VARIABLE, "v5"),
                                        Collections.emptyList()
                                    ),
                                    new TreeNode(
                                        new TreeNodePayload(VARIABLE, "v6"),
                                        Collections.emptyList()
                                    )
                                )
                            )
                        )
                    )
                )
            ),
            new TreeNode(
                new TreeNodePayload(ONTOLOGY, "o2"),
                Arrays.asList(
                    new TreeNode(
                        new TreeNodePayload(TRAIT_CLASS, "o2:tc1"),
                        Arrays.asList(
                            new TreeNode(
                                new TreeNodePayload(TRAIT, "t1"),
                                Arrays.asList(
                                    new TreeNode(
                                        new TreeNodePayload(VARIABLE, "v1"),
                                        Collections.emptyList()
                                    ),
                                    new TreeNode(
                                        new TreeNodePayload(VARIABLE, "v2"),
                                        Collections.emptyList()
                                    )
                                )
                            )
                        )
                    ),
                    new TreeNode(
                        new TreeNodePayload(TRAIT, "t2"),
                        Arrays.asList(
                            new TreeNode(
                                new TreeNodePayload(VARIABLE, "v3"),
                                Collections.emptyList()
                            ),
                            new TreeNode(
                                new TreeNodePayload(VARIABLE, "v4"),
                                Collections.emptyList()
                            )
                        )
                    )
                )
            )
        );

        assertThat(ontologyService.getOntology("o1", DEFAULT_LANGUAGE).get().getOntology().getOntologyName()).isEqualTo("O1");
        assertThat(ontologyService.getOntology("unknown", DEFAULT_LANGUAGE)).isEmpty();

        assertThat(ontologyService.getTraitClass("o2:tc1", DEFAULT_LANGUAGE).get().getName()).isEqualTo("TC1");
        assertThat(ontologyService.getTraitClass("o2:tc1", DEFAULT_LANGUAGE).get().getOntologyName()).isEqualTo("O2");
        assertThat(ontologyService.getTraitClass("unknown", DEFAULT_LANGUAGE)).isEmpty();

        assertThat(ontologyService.getTrait("t1", DEFAULT_LANGUAGE).get().getTrait().getName()).isEqualTo("T1");
        assertThat(ontologyService.getTrait("t3", "FR").get().getTrait().getName()).isEqualTo("T3-FR");
        assertThat(ontologyService.getTrait("unknown", DEFAULT_LANGUAGE)).isEmpty();

        assertThat(ontologyService.getVariable("v1", DEFAULT_LANGUAGE).get().getVariable().getName()).isEqualTo("V1");
        assertThat(ontologyService.getVariable("v7", DEFAULT_LANGUAGE).get().getVariable().getName()).isEqualTo("V7");
        assertThat(ontologyService.getVariable("v7", "FR").get().getVariable().getName()).isEqualTo("V7");
        assertThat(ontologyService.getVariable("v8", DEFAULT_LANGUAGE).get().getVariable().getName()).isEqualTo("V8");
        assertThat(ontologyService.getVariable("v8", "FR").get().getVariable().getName()).isEqualTo("V8-FR");
        assertThat(ontologyService.getVariable("unknown", DEFAULT_LANGUAGE)).isEmpty();

        TreeI18n englishTreeI18n = ontologyService.getTreeI18n("EN");
        assertThat(englishTreeI18n.getLanguage()).isEqualTo("EN");
        assertThat(englishTreeI18n.getNames().get(TRAIT).get("t3")).isEqualTo("T3");
        assertThat(englishTreeI18n.getNames().get(VARIABLE).get("v7")).isEqualTo("V7");
        assertThat(englishTreeI18n.getNames().get(VARIABLE).get("v8")).isEqualTo("V8");

        TreeI18n frenchTreeI18n = ontologyService.getTreeI18n("FR");
        assertThat(frenchTreeI18n.getLanguage()).isEqualTo("FR");
        assertThat(frenchTreeI18n.getNames().get(TRAIT).get("t3")).isEqualTo("T3-FR");
        assertThat(englishTreeI18n.getNames().get(VARIABLE).get("v7")).isEqualTo("V7");
        assertThat(frenchTreeI18n.getNames().get(VARIABLE).get("v8")).isEqualTo("V8-FR");
    }
}
