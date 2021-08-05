package fr.inra.urgi.datadiscovery.ontology.state;

/**
 * The details of a trait class, as returned to the UI when it highlights a trait class node of the tree.
 * @author JB Nizet
 */
public final class TraitClassDetails {
    private final String id;
    private final String name;
    private final String ontologyName;

    public TraitClassDetails(String id, String name, String ontologyName) {
        this.id = id;
        this.name = name;
        this.ontologyName = ontologyName;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getOntologyName() {
        return ontologyName;
    }
}
