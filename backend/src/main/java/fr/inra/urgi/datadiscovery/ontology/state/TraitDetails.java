package fr.inra.urgi.datadiscovery.ontology.state;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import fr.inra.urgi.datadiscovery.ontology.api.Trait;

/**
 * The details of a trait name, as returned to the UI when it highlights a trait name node of the tree.
 * @author JB Nizet
 */
public final class TraitDetails {
    @JsonUnwrapped
    private final Trait trait;
    private final String ontologyName;

    public TraitDetails(Trait trait, String ontologyName) {
        this.trait = trait;
        this.ontologyName = ontologyName;
    }

    public Trait getTrait() {
        return trait;
    }

    public String getOntologyName() {
        return ontologyName;
    }
}
