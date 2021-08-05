package fr.inra.urgi.datadiscovery.ontology.state;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import fr.inra.urgi.datadiscovery.ontology.api.Ontology;

/**
 * The details of an ontology, as returned to the UI when it highlights an ontology node of the tree.
 * @author JB Nizet
 */
public final class OntologyDetails {
    @JsonUnwrapped
    private final Ontology ontology;

    public OntologyDetails(Ontology ontology) {
        this.ontology = ontology;
    }

    public Ontology getOntology() {
        return ontology;
    }
}
