package fr.inra.urgi.datadiscovery.ontology.state;

import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * A node of the ontology tree as returned by Faidare to the browser.
 * It contains as few information as possible in order to limit the bandwidth necessary to download the tree
 *
 * @author JB Nizet
 */
public final class TreeNode {
    private final TreeNodePayload payload;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private final List<TreeNode> children;

    public TreeNode(TreeNodePayload payload, List<TreeNode> children) {
        this.payload = payload;
        this.children = children;
    }

    public TreeNodePayload getPayload() {
        return payload;
    }

    public List<TreeNode> getChildren() {
        return children;
    }

    @Override
    public String toString() {
        return "TreeNode{" +
            "payload=" + payload +
            ", children=" + children +
            '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        TreeNode treeNode = (TreeNode) o;
        return Objects.equals(payload, treeNode.payload) && Objects.equals(children, treeNode.children);
    }

    @Override
    public int hashCode() {
        return Objects.hash(payload, children);
    }
}
