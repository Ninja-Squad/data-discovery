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
    private final String name;

    public TreeNodePayload(TreeNodeType type, String id, String name) {
        this.type = type;
        this.id = id;
        this.name = name;
    }

    public TreeNodeType getType() {
        return type;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
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
        return type == that.type && Objects.equals(id, that.id) && Objects.equals(name, that.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(type, id, name);
    }

    @Override
    public String toString() {
        return "TreeNodePayload{" +
            "type=" + type +
            ", id='" + id + '\'' +
            ", name='" + name + '\'' +
            '}';
    }
}
