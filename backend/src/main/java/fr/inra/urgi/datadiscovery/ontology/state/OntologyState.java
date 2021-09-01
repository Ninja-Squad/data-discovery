package fr.inra.urgi.datadiscovery.ontology.state;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * The immutable state of the {@link fr.inra.urgi.datadiscovery.ontology.OntologyService}, which is refreshed (i.e. replaced by a new state)
 * on a regular basis
 *
 * @author JB Nizet
 */
public final class OntologyState {
    private final List<TreeNode> tree;
    private final Map<String, TreeI18n> treeI18nsByLanguage;
    private final Map<String, Translations<OntologyDetails>> ontologies;
    private final Map<String, Translations<TraitClassDetails>> traitClasses;
    private final Map<String, Translations<TraitDetails>> traits;
    private final Map<String, Translations<VariableDetails>> variables;

    public OntologyState(List<TreeNode> tree,
                         Map<String, TreeI18n> treeI18nsByLanguage,
                         Map<String, Translations<OntologyDetails>> ontologies,
                         Map<String, Translations<TraitClassDetails>> traitClasses,
                         Map<String, Translations<TraitDetails>> traits,
                         Map<String, Translations<VariableDetails>> variables) {
        this.tree = tree;
        this.treeI18nsByLanguage = treeI18nsByLanguage;
        this.ontologies = ontologies;
        this.traitClasses = traitClasses;
        this.traits = traits;
        this.variables = variables;
    }

    public List<TreeNode> getTree() {
        return tree;
    }

    public Optional<TreeI18n> getTreeI18n(String language) {
        return Optional.ofNullable(treeI18nsByLanguage.get(language));
    }

    public Optional<Translations<OntologyDetails>> getOntology(String id) {
        return Optional.ofNullable(ontologies.get(id));
    }

    public Optional<Translations<TraitClassDetails>> getTraitClass(String id) {
        return Optional.ofNullable(traitClasses.get(id));
    }

    public Optional<Translations<TraitDetails>> getTrait(String id) {
        return Optional.ofNullable(traits.get(id));
    }

    public Optional<Translations<VariableDetails>> getVariable(String id) {
        return Optional.ofNullable(variables.get(id));
    }
}
