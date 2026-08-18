package fr.inra.urgi.datadiscovery.ontology;

import static fr.inra.urgi.datadiscovery.ontology.OntologyService.DEFAULT_LANGUAGE;
import static fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType.ONTOLOGY;
import static fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType.TRAIT;
import static fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType.TRAIT_CLASS;
import static fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType.VARIABLE;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

import fr.inra.urgi.datadiscovery.ontology.api.OntologyApiService;
import fr.inra.urgi.datadiscovery.ontology.state.TreeI18n;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNode;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Manual integration test for {@link OntologyService} against the public beta BrAPI endpoint.
 * Run this class directly from IDEA when you want to debug the refresh sequence.
 *
 * @author Copilot
 */
class OntologyServiceIT {

    private static final String PUBLIC_BETA_BRAPI_BASE_URL = "https://beta-urgi.versailles.inrae.fr/faidare/brapi";
    private static final int MAX_IN_MEMORY_SIZE = 5 * 1024 * 1024;

    @Test
    @Timeout(value = 2, unit = TimeUnit.MINUTES)
    void shouldRefreshOntologyFromThePublicBetaBrapi() {
        OntologyApiService ontologyApiService =
            new OntologyApiService(WebClient.builder()
                                            .codecs(configurer -> configurer.defaultCodecs()
                                                                            .maxInMemorySize(MAX_IN_MEMORY_SIZE))
                                            .baseUrl(PUBLIC_BETA_BRAPI_BASE_URL)
                                            .build());
        OntologyClient ontologyClient = new OntologyClient(ontologyApiService);
        OntologyService ontologyService = new OntologyService(ontologyClient, new TraitClassIdGenerator());

        ontologyService.refreshOntology();

        List<TreeNode> tree = ontologyService.getTree();
        assertThat(tree).isNotEmpty();

        TreeNode firstOntology = tree.get(0);
        assertThat(firstOntology.getPayload().getType()).isEqualTo(ONTOLOGY);
        assertThat(ontologyService.getOntology(firstOntology.getPayload().getId(), DEFAULT_LANGUAGE)).isPresent();

        TreeI18n defaultTreeI18n = ontologyService.getTreeI18n(DEFAULT_LANGUAGE);
        assertThat(defaultTreeI18n.getNames().get(ONTOLOGY)).containsKey(firstOntology.getPayload().getId());

        Optional<TreeNode> firstTraitClass = firstNodeOfType(tree, TRAIT_CLASS);
        assertThat(firstTraitClass).isPresent();
        assertThat(ontologyService.getTraitClass(firstTraitClass.orElseThrow().getPayload().getId(), DEFAULT_LANGUAGE)).isPresent();

        Optional<TreeNode> firstTrait = firstNodeOfType(tree, TRAIT);
        assertThat(firstTrait).isPresent();
        assertThat(ontologyService.getTrait(firstTrait.orElseThrow().getPayload().getId(), DEFAULT_LANGUAGE)).isPresent();

        Optional<TreeNode> firstVariable = firstNodeOfType(tree, VARIABLE);
        assertThat(firstVariable).isPresent();
        assertThat(ontologyService.getVariable(firstVariable.orElseThrow().getPayload().getId(), DEFAULT_LANGUAGE)).isPresent();
    }

    private Optional<TreeNode> firstNodeOfType(List<TreeNode> nodes, TreeNodeType expectedType) {
        return nodes.stream()
                    .flatMap(node -> streamNodes(node))
                    .filter(node -> node.getPayload().getType() == expectedType)
                    .findFirst();
    }

    private Stream<TreeNode> streamNodes(TreeNode node) {
        return Stream.concat(Stream.of(node), node.getChildren().stream().flatMap(this::streamNodes));
    }
}
