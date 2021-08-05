package fr.inra.urgi.datadiscovery.ontology.state;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * The immutable state of the {@link fr.inra.urgi.datadiscovery.ontology.OntologyService}, which is refreshed (i.e. replaced by a new state)
 * on a rgular basis
 *
 * @author JB Nizet
 */
public final class OntologyState {
    private final List<TreeNode> tree;
    private final Map<String, OntologyDetails> ontologies;
    private final Map<String, TraitClassDetails> traitClasses;
    private final Map<String, TraitDetails> traits;
    private final Map<String, VariableDetails> variables;

    public OntologyState(List<TreeNode> tree,
                         Map<String, OntologyDetails> ontologies,
                         Map<String, TraitClassDetails> traitClasses,
                         Map<String, TraitDetails> traits,
                         Map<String, VariableDetails> variables) {
        this.tree = tree;
        this.ontologies = ontologies;
        this.traitClasses = traitClasses;
        this.traits = traits;
        this.variables = variables;
    }

    public List<TreeNode> getTree() {
        return tree;
    }

    public Optional<OntologyDetails> getOntology(String id) {
        return Optional.ofNullable(ontologies.get(id));
    }

    public Optional<TraitClassDetails> getTraitClass(String id) {
        return Optional.ofNullable(traitClasses.get(id));
    }

    public Optional<TraitDetails> getTrait(String id) {
        return Optional.ofNullable(traits.get(id));
    }

    public Optional<VariableDetails> getVariable(String id) {
        return Optional.ofNullable(variables.get(id));
    }
}
