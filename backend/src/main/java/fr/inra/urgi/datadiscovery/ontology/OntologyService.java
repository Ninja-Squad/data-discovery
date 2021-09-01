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
import java.util.function.Function;
import java.util.stream.Collectors;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.ontology.api.Ontology;
import fr.inra.urgi.datadiscovery.ontology.api.Variable;
import fr.inra.urgi.datadiscovery.ontology.state.OntologyDetails;
import fr.inra.urgi.datadiscovery.ontology.state.OntologyState;
import fr.inra.urgi.datadiscovery.ontology.state.TraitClassDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TraitDetails;
import fr.inra.urgi.datadiscovery.ontology.state.Translations;
import fr.inra.urgi.datadiscovery.ontology.state.TreeI18n;
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
 * Service used as a caching proxy to the BrAPI. At startup, it loads all the variables in memory and computes the ontology tree.
 * Every hour, it refreshes this tree.
 *
 * @author JB Nizet
 */
@Service
@Profile({AppProfile.FAIDARE})
public class OntologyService implements CommandLineRunner {

    public static final String DEFAULT_LANGUAGE = "EN";

    private static final Logger LOGGER = LoggerFactory.getLogger(OntologyService.class);

    private final OntologyClient ontologyClient;
    private final TraitClassIdGenerator traitClassIdGenerator;

    private static final Map<String, TreeI18n> DEFAULT_TREE_I18Ns =
        Collections.singletonMap(DEFAULT_LANGUAGE, new TreeI18n(DEFAULT_LANGUAGE, Collections.emptyMap()));

    /**
     * The state, stored in an AtomicReference to make sure changes are visible by all threads reading it.
     */
    private final AtomicReference<OntologyState> state = new AtomicReference<>(new OntologyState(Collections.emptyList(),
                                                                                                 DEFAULT_TREE_I18Ns,
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

    public TreeI18n getTreeI18n(String language) {
        OntologyState ontologyState = this.state.get();
        return ontologyState.getTreeI18n(language)
                            .orElseGet(() -> ontologyState.getTreeI18n(DEFAULT_LANGUAGE).orElseThrow(
                                () -> new IllegalStateException("TreeI18n for default language is supposed to always exist")));
    }

    public Optional<OntologyDetails> getOntology(String id, String language) {
        return this.state.get().getOntology(id).map(translations -> translations.forLanguage(language));
    }

    public Optional<TraitClassDetails> getTraitClass(String id, String language) {
        return this.state.get().getTraitClass(id).map(translations -> translations.forLanguage(language));
    }

    public Optional<TraitDetails> getTrait(String id, String language) {
        return this.state.get().getTrait(id).map(translations -> translations.forLanguage(language));
    }

    public Optional<VariableDetails> getVariable(String id, String language) {
        return this.state.get().getVariable(id).map(translations -> translations.forLanguage(language));
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
        Set<String> languages = new HashSet<>();
        languages.add(DEFAULT_LANGUAGE);
        Map<String, Translations<OntologyDetails>> ontologiesById =
            ontologies.stream().collect(Collectors.toMap(Ontology::getOntologyDbId, ontrology -> {
                Translations<OntologyDetails> translations = new Translations<>();
                translations.putTranslation(DEFAULT_LANGUAGE, new OntologyDetails(ontrology));
                return translations;
            }));
        Map<String, Translations<TraitClassDetails>> traitClassesById = new HashMap<>();
        Map<String, Translations<TraitDetails>> traitsById = new HashMap<>();
        Map<String, Translations<VariableDetails>> variablesById = new HashMap<>();

        Map<TreeNodePayload, MutableNode> nodesByPayload = new HashMap<>();
        for (Variable variable : variables) {
            if (variable.getLanguage() != null) {
                languages.add(variable.getLanguage());
            }
            TreeNodePayload ontologyPayload = new TreeNodePayload(TreeNodeType.ONTOLOGY,
                                                                  variable.getOntologyDbId());
            TreeNodePayload traitClassPayload = null;
            if (variable.getTrait().getTraitClass() != null) {
                traitClassPayload = new TreeNodePayload(TreeNodeType.TRAIT_CLASS,
                                                        traitClassIdGenerator.generateId(variable.getOntologyDbId(), variable.getTrait().getTraitClass()));
            }
            TreeNodePayload traitPayload = new TreeNodePayload(TreeNodeType.TRAIT,
                                                               variable.getTrait().getTraitDbId());
            TreeNodePayload variablePayload = new TreeNodePayload(TreeNodeType.VARIABLE,
                                                                  variable.getObservationVariableDbId());

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
                traitClassesById.computeIfAbsent(traitClassPayload.getId(), id -> new Translations<>()).putTranslation(
                    variable.getLanguage(),
                    new TraitClassDetails(traitClassPayload.getId(),
                                          variable.getTrait().getTraitClass(),
                                          variable.getOntologyName())
                );
            }
            traitsById.computeIfAbsent(traitPayload.getId(), id -> new Translations<>()).putTranslation(
                variable.getLanguage(),
                new TraitDetails(variable.getTrait(), variable.getOntologyName())
            );
            variablesById.computeIfAbsent(variablePayload.getId(), id -> new Translations<>()).putTranslation(
                variable.getLanguage(),
                new VariableDetails(variable)
            );
        }

        List<TreeNode> tree = createTree(nodesByPayload);
        Map<String, TreeI18n> treeI18ns = createTreeI18ns(languages, ontologiesById, traitClassesById, traitsById, variablesById);
        return new OntologyState(tree, treeI18ns, ontologiesById, traitClassesById, traitsById, variablesById);
    }

    private List<TreeNode> createTree(Map<TreeNodePayload, MutableNode> nodesByPayload) {
        return nodesByPayload
                .values()
                .stream()
                .filter(mutableNode -> mutableNode.getPayload().getType() == TreeNodeType.ONTOLOGY)
                .map(this::createTreeNode)
                .sorted(Comparator.comparing(treeNode -> treeNode.getPayload().getId()))
                .collect(Collectors.toList());
    }

    private TreeNode createTreeNode(MutableNode mutableNode) {
        List<TreeNode> children = mutableNode
                .getChildren()
                .stream()
                .map(this::createTreeNode)
                .sorted(Comparator.comparing(treeNode -> treeNode.getPayload().getId()))
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

    private Map<String, TreeI18n> createTreeI18ns(Set<String> languages,
                                                  Map<String, Translations<OntologyDetails>> ontologiesById,
                                                  Map<String, Translations<TraitClassDetails>> traitClassesById,
                                                  Map<String, Translations<TraitDetails>> traitsById,
                                                  Map<String, Translations<VariableDetails>> variablesById) {
        return languages.stream()
                        .collect(Collectors.toMap(Function.identity(),
                                                  language -> createTreeI18n(language,
                                                                             ontologiesById,
                                                                             traitClassesById,
                                                                             traitsById,
                                                                             variablesById)));
    }

    private TreeI18n createTreeI18n(String language,
                                    Map<String, Translations<OntologyDetails>> ontologiesById,
                                    Map<String, Translations<TraitClassDetails>> traitClassesById,
                                    Map<String, Translations<TraitDetails>> traitsById,
                                    Map<String, Translations<VariableDetails>> variablesById) {
        Map<TreeNodeType, Map<String, String>> translations = new HashMap<>();

        translations.put(TreeNodeType.ONTOLOGY, namesById(ontologiesById, language, ontologyDetails -> ontologyDetails.getOntology().getOntologyName()));
        translations.put(TreeNodeType.TRAIT_CLASS, namesById(traitClassesById, language, traitClassDetails -> traitClassDetails.getName()));
        translations.put(TreeNodeType.TRAIT, namesById(traitsById, language, traitDetails -> traitDetails.getTrait().getName()));
        translations.put(TreeNodeType.VARIABLE, namesById(variablesById, language, variableDetails -> {
            if (variableDetails.getVariable().getSynonyms() != null && variableDetails.getVariable().getSynonyms().size() > 0) {
                return variableDetails.getVariable().getName() + ": " + variableDetails.getVariable().getSynonyms().get(0);
            } else {
                return variableDetails.getVariable().getName();
            }
        }));

        return new TreeI18n(language, translations);
    }

    private <T> Map<String, String> namesById(Map<String, Translations<T>> translationsById, String language, Function<T, String> nameAccessor) {
        return translationsById.entrySet()
                               .stream()
                               .collect(Collectors.toMap(
                                   Map.Entry::getKey,
                                   entry -> nameAccessor.apply(entry.getValue().forLanguage(language))
                               ));
    }
}
