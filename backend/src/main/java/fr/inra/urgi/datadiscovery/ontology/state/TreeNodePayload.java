package fr.inra.urgi.datadiscovery.ontology.state;

import java.util.Objects;

/**
 * The payload of a {@link TreeNode}
 *
 * @author JB Nizet
 */
public final class TreeNodePayload {
    private final TreeNodeType type;
    private final String id;

    public TreeNodePayload(TreeNodeType type, String id) {
        this.type = type;
        this.id = id;
    }

    public TreeNodeType getType() {
        return type;
    }

    public String getId() {
        return id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        TreeNodePayload that = (TreeNodePayload) o;
        return type == that.type && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(type, id);
    }

    @Override
    public String toString() {
        return "TreeNodePayload{" +
            "type=" + type +
            ", id='" + id + '\'' +
            '}';
    }
}
