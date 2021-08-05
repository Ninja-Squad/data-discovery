package fr.inra.urgi.datadiscovery.ontology;

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
                        .build()
            )
        ));

        ontologyService.run();
        List<TreeNode> tree = ontologyService.getTree();
        assertThat(tree).containsExactly(
            new TreeNode(
                new TreeNodePayload(ONTOLOGY, "o1", "O1"),
                Arrays.asList(
                    new TreeNode(
                        new TreeNodePayload(TRAIT_CLASS, "o1:tc3", "TC3"),
                        Arrays.asList(
                            new TreeNode(
                                new TreeNodePayload(TRAIT, "t3", "T3"),
                                Arrays.asList(
                                    new TreeNode(
                                        new TreeNodePayload(VARIABLE, "v7", "V7"),
                                        Collections.emptyList()
                                    ),
                                    new TreeNode(
                                        new TreeNodePayload(VARIABLE, "v8", "V8"),
                                        Collections.emptyList()
                                    )
                                )
                            ),
                            new TreeNode(
                                new TreeNodePayload(TRAIT, "t4", "T4"),
                                Arrays.asList(
                                    new TreeNode(
                                        new TreeNodePayload(VARIABLE, "v5", "V5"),
                                        Collections.emptyList()
                                    ),
                                    new TreeNode(
                                        new TreeNodePayload(VARIABLE, "v6", "V6"),
                                        Collections.emptyList()
                                    )
                                )
                            )
                        )
                    )
                )
            ),
            new TreeNode(
                new TreeNodePayload(ONTOLOGY, "o2", "O2"),
                Arrays.asList(
                    new TreeNode(
                        new TreeNodePayload(TRAIT, "t2", "T2"),
                        Arrays.asList(
                            new TreeNode(
                                new TreeNodePayload(VARIABLE, "v3", "V3"),
                                Collections.emptyList()
                            ),
                            new TreeNode(
                                new TreeNodePayload(VARIABLE, "v4", "V4"),
                                Collections.emptyList()
                            )
                        )
                    ),
                    new TreeNode(
                        new TreeNodePayload(TRAIT_CLASS, "o2:tc1", "TC1"),
                        Arrays.asList(
                            new TreeNode(
                                new TreeNodePayload(TRAIT, "t1", "T1"),
                                Arrays.asList(
                                    new TreeNode(
                                        new TreeNodePayload(VARIABLE, "v1", "V1"),
                                        Collections.emptyList()
                                    ),
                                    new TreeNode(
                                        new TreeNodePayload(VARIABLE, "v2", "V2"),
                                        Collections.emptyList()
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );

        assertThat(ontologyService.getOntology("o1").get().getOntology().getOntologyName()).isEqualTo("O1");
        assertThat(ontologyService.getOntology("unknown")).isEmpty();

        assertThat(ontologyService.getTraitClass("o2:tc1").get().getName()).isEqualTo("TC1");
        assertThat(ontologyService.getTraitClass("o2:tc1").get().getOntologyName()).isEqualTo("O2");
        assertThat(ontologyService.getTraitClass("unknown")).isEmpty();

        assertThat(ontologyService.getTrait("t1").get().getTrait().getName()).isEqualTo("T1");
        assertThat(ontologyService.getTrait("unknown")).isEmpty();

        assertThat(ontologyService.getVariable("v1").get().getVariable().getName()).isEqualTo("V1");
        assertThat(ontologyService.getVariable("unknown")).isEmpty();
    }
}
