package fr.inra.urgi.datadiscovery.ontology;

import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.ontology.api.Ontology;
import fr.inra.urgi.datadiscovery.ontology.api.Variable;
import fr.inra.urgi.datadiscovery.ontology.state.OntologyDetails;
import fr.inra.urgi.datadiscovery.ontology.state.OntologyState;
import fr.inra.urgi.datadiscovery.ontology.state.TraitClassDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TraitDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNode;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNodePayload;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNodeType;
import fr.inra.urgi.datadiscovery.ontology.state.VariableDetails;
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
    private final TraitClassIdGenerator traitClassIdGenerator;

    /**
     * The state, stored in an AtomicReference to make sure changes are visible by all threads reading it.
     */
    private final AtomicReference<OntologyState> state = new AtomicReference<>(new OntologyState(Collections.emptyList(),
                                                                                                 Collections.emptyMap(),
                                                                                                 Collections.emptyMap(),
                                                                                                 Collections.emptyMap(),
                                                                                                 Collections.emptyMap()));

    public OntologyService(OntologyClient ontologyClient, TraitClassIdGenerator traitClassIdGenerator) {
        this.ontologyClient = ontologyClient;
        this.traitClassIdGenerator = traitClassIdGenerator;
    }

    @Scheduled(cron = "0 0 * * * *") // every hour
    public void refreshOntology() {
        try {
            LOGGER.info("Refreshing ontologies...");
            doRefreshOntologies();
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

    public Optional<OntologyDetails> getOntology(String id) {
        return this.state.get().getOntology(id);
    }

    public Optional<TraitClassDetails> getTraitClass(String id) {
        return this.state.get().getTraitClass(id);
    }

    public Optional<TraitDetails> getTrait(String id) {
        return this.state.get().getTrait(id);
    }

    public Optional<VariableDetails> getVariable(String id) {
        return this.state.get().getVariable(id);
    }

    private void initializeOntology() {
        try {
            LOGGER.info("Initializing ontologies...");
            doRefreshOntologies();
        } catch (Exception e) {
            LOGGER.error("Exception while loading ontology. The ontology aggregation will not work. Retrying every hour...", e);
        }
    }

    private void doRefreshOntologies() {
        List<Ontology> ontologies = ontologyClient.getAllOntologies().block();
        List<Variable> variables = ontologyClient.getAllVariables().block();
        this.state.set(createState(ontologies, variables));
    }

    private OntologyState createState(List<Ontology> ontologies, List<Variable> variables) {
        Map<String, OntologyDetails> ontologiesById =
            ontologies.stream().collect(Collectors.toMap(Ontology::getOntologyDbId, OntologyDetails::new));
        Map<String, TraitClassDetails> traitClassesById = new HashMap<>();
        Map<String, TraitDetails> traitsById = new HashMap<>();
        Map<String, VariableDetails> variablesById = new HashMap<>();

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
                                                            traitClassIdGenerator.generateId(variable.getOntologyDbId(), variable.getTrait().getTraitClass()),
                                                            variable.getTrait().getTraitClass());
                }
                TreeNodePayload traitPayload = new TreeNodePayload(TreeNodeType.TRAIT,
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
                MutableNode traitNode = nodesByPayload.computeIfAbsent(traitPayload, MutableNode::new);
                MutableNode variableNode = nodesByPayload.computeIfAbsent(variablePayload, MutableNode::new);

                if (traitClassPayload != null) {
                    ontologyNode.addChild(traitClassNode);
                    traitClassNode.addChild(traitNode);
                } else {
                    ontologyNode.addChild(traitNode);
                }
                traitNode.addChild(variableNode);

                if (traitClassPayload != null) {
                    traitClassesById.put(traitClassPayload.getId(), new TraitClassDetails(traitClassPayload.getId(),
                                                                                          traitClassPayload.getName(),
                                                                                          variable.getOntologyName()));
                }
                traitsById.put(traitPayload.getId(), new TraitDetails(variable.getTrait(), variable.getOntologyName()));
                variablesById.put(variablePayload.getId(), new VariableDetails(variable));
            }
        }

        List<TreeNode> tree = createTree(nodesByPayload);
        return new OntologyState(tree, ontologiesById, traitClassesById, traitsById, variablesById);
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
