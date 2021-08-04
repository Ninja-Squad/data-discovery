package fr.inra.urgi.datadiscovery.ontology;

import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.ontology.api.Variable;
import fr.inra.urgi.datadiscovery.ontology.state.OntologyState;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNode;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNodePayload;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Service used as a caching proxy to the BRApi. At startup, it loads all the variables in memory and computes the ontology tree.
 * Every hour, it refreshes this tree.
 *
 * @author JB Nizet
 */
@Service
@Profile({AppProfile.FAIDARE})
public class OntologyService implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(OntologyService.class);

    private final OntologyClient ontologyClient;

    /**
     * The state, stored in an AtomicReference to make sure changes are visible by all threads reading it.
     */
    private final AtomicReference<OntologyState> state = new AtomicReference<>(new OntologyState(Collections.emptyList()));

    public OntologyService(OntologyClient ontologyClient) {
        this.ontologyClient = ontologyClient;
    }

    @Scheduled(cron = "0 0 * * * *") // every hour
    public void refreshOntology() {
        try {
            LOGGER.info("Refreshing ontologies...");
            List<Variable> variables = ontologyClient.getAllVariables().block();
            this.state.set(createState(variables));
        } catch (Exception e) {
            LOGGER.error("Exception while refreshing ontology. Keep using the current one. Retrying every hour...", e);
        }
    }

    @Override
    public void run(String... args) {
        initializeOntology();
    }

    /**
     * Gets the ontology tree that was last loaded
     */
    public List<TreeNode> getTree() {
        return this.state.get().getTree();
    }

    private void initializeOntology() {
        try {
            LOGGER.info("Initializing ontologies...");
            List<Variable> variables = ontologyClient.getAllVariables().block();
            this.state.set(createState(variables));
        } catch (Exception e) {
            LOGGER.error("Exception while loading ontology. The ontology aggregation will not work. Retrying every hour...", e);
        }
    }

    private OntologyState createState(List<Variable> variables) {
        // For the moment, we will ignore variables which are not in the English language
        // FIXME JBN: deal with multiple languages
        Map<TreeNodePayload, MutableNode> nodesByPayload = new HashMap<>();
        for (Variable variable : variables) {
            if (variable.getLanguage() == null || variable.getLanguage().equals("EN")) {
                TreeNodePayload ontologyPayload = new TreeNodePayload(TreeNodeType.ONTOLOGY,
                                                                      variable.getOntologyDbId(),
                                                                      variable.getOntologyName());
                TreeNodePayload traitClassPayload = null;
                if (variable.getTrait().getTraitClass() != null) {
                    traitClassPayload = new TreeNodePayload(TreeNodeType.TRAIT_CLASS,
                                                            variable.getOntologyDbId() + ":" + variable.getTrait().getTraitClass(),
                                                            variable.getTrait().getTraitClass());
                }
                TreeNodePayload traitNamePayload = new TreeNodePayload(TreeNodeType.TRAIT_NAME,
                                                                       variable.getTrait().getTraitDbId(),
                                                                       variable.getTrait().getName());
                TreeNodePayload variablePayload = new TreeNodePayload(TreeNodeType.VARIABLE,
                                                                      variable.getObservationVariableDbId(),
                                                                      variable.getName());

                MutableNode ontologyNode = nodesByPayload.computeIfAbsent(ontologyPayload, MutableNode::new);
                MutableNode traitClassNode = null;
                if (traitClassPayload != null) {
                    traitClassNode = nodesByPayload.computeIfAbsent(traitClassPayload, MutableNode::new);
                }
                MutableNode traitNameNode = nodesByPayload.computeIfAbsent(traitNamePayload, MutableNode::new);
                MutableNode variableNode = nodesByPayload.computeIfAbsent(variablePayload, MutableNode::new);

                if (traitClassPayload != null) {
                    ontologyNode.addChild(traitClassNode);
                    traitClassNode.addChild(traitNameNode);
                } else {
                    ontologyNode.addChild(traitNameNode);
                }
                traitNameNode.addChild(variableNode);
            }
        }

        List<TreeNode> tree = createTree(nodesByPayload);
        return new OntologyState(tree);
    }

    private List<TreeNode> createTree(Map<TreeNodePayload, MutableNode> nodesByPayload) {
        return nodesByPayload
                .values()
                .stream()
                .filter(mutableNode -> mutableNode.getPayload().getType() == TreeNodeType.ONTOLOGY)
                .map(this::createTreeNode)
                .sorted(Comparator.comparing(treeNode -> treeNode.getPayload().getName()))
                .collect(Collectors.toList());
    }

    private TreeNode createTreeNode(MutableNode mutableNode) {
        List<TreeNode> children = mutableNode
                .getChildren()
                .stream()
                .map(this::createTreeNode)
                .sorted(Comparator.comparing(treeNode -> treeNode.getPayload().getName()))
                .collect(Collectors.toList());
        return new TreeNode(mutableNode.getPayload(), children);
    }

    private static class MutableNode {
        private final TreeNodePayload payload;
        private final Set<MutableNode> children = new HashSet<>();

        public MutableNode(TreeNodePayload payload) {
            this.payload = payload;
        }

        public void addChild(MutableNode node) {
            this.children.add(node);
        }

        public TreeNodePayload getPayload() {
            return payload;
        }

        public Set<MutableNode> getChildren() {
            return children;
        }
    }
}
