package fr.inra.urgi.datadiscovery.ontology.api;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * The result of an {@link ApiResponse} from the "list variables" endpoint of the BrAPI API
 *
 * @author JB Nizet
 */
public final class VariablesResult {
    @JsonProperty("data")
    private final List<Variable> variables;

    @JsonCreator
    public VariablesResult(List<Variable> variables) {
        this.variables = variables;
    }

    public List<Variable> getVariables() {
        return variables;
    }

    @Override
    public String toString() {
        return "VariablesResult{" +
                "variables=" + variables +
                '}';
    }
}
