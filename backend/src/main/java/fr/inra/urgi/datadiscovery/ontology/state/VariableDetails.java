package fr.inra.urgi.datadiscovery.ontology.state;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import fr.inra.urgi.datadiscovery.ontology.api.Variable;

/**
 * The details of a variable, as returned to the UI when it highlights a variable node of the tree.
 * @author JB Nizet
 */
public final class VariableDetails {
    @JsonUnwrapped
    private final Variable variable;

    public VariableDetails(Variable variable) {
        this.variable = variable;
    }

    public Variable getVariable() {
        return variable;
    }
}
