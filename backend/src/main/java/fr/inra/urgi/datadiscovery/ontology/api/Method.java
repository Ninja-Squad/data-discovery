package fr.inra.urgi.datadiscovery.ontology.api;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * The Method of a {@link Variable}
 *
 * @author JB Nizet
 */
public class Method {
    private final String name;
    @JsonProperty("class")
    private final String methodClass;
    private final String description;
    private final String formula;
    private final String methodDbId;
    private final String reference;

    public Method(String name, String methodClass, String description, String formula, String methodDbId, String reference) {
        this.name = name;
        this.methodClass = methodClass;
        this.description = description;
        this.formula = formula;
        this.methodDbId = methodDbId;
        this.reference = reference;
    }

    public String getName() {
        return name;
    }

    public String getMethodClass() {
        return methodClass;
    }

    public String getDescription() {
        return description;
    }

    public String getFormula() {
        return formula;
    }

    public String getMethodDbId() {
        return methodDbId;
    }

    public String getReference() {
        return reference;
    }

    @Override
    public String toString() {
        return "Method{" +
            "name='" + name + '\'' +
            ", methodClass='" + methodClass + '\'' +
            ", description='" + description + '\'' +
            ", formula='" + formula + '\'' +
            ", methodDbId='" + methodDbId + '\'' +
            ", reference='" + reference + '\'' +
            '}';
    }
}
