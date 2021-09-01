package fr.inra.urgi.datadiscovery.ontology.api;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * The result of an {@link ApiResponse} from the "list ontologies" endpoint of the BrAPI API
 *
 * @author JB Nizet
 */
public final class OntologiesResult {
    @JsonProperty("data")
    private final List<Ontology> ontologies;

    @JsonCreator
    public OntologiesResult(List<Ontology> ontologies) {
        this.ontologies = ontologies;
    }

    public List<Ontology> getOntologies() {
        return ontologies;
    }

    @Override
    public String toString() {
        return "OntologiesResult{" +
            "ontologies=" + ontologies +
            '}';
    }
}
