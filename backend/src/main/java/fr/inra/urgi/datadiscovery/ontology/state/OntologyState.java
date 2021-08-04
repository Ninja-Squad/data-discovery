package fr.inra.urgi.datadiscovery.ontology.state;

import java.util.List;

/**
 * The immutable state of the {@link fr.inra.urgi.datadiscovery.ontology.OntologyService}, which is refreshed (i.e. replaced by a new state)
 * on a rgular basis
 *
 * @author JB Nizet
 */
public final class OntologyState {
    private final List<TreeNode> tree;

    public OntologyState(List<TreeNode> tree) {
        this.tree = tree;
    }

    public List<TreeNode> getTree() {
        return tree;
    }
}
