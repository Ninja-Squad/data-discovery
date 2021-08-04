package fr.inra.urgi.datadiscovery.ontology.api;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * A Scale of a {@link Variable}
 *
 * @author JB Nizet
 */
public class Scale {
    private final String name;
    private final String dataType;
    private final String decimalPlaces;
    private final String scaleDbId;
    private final ValidValues validValues;
    private final String xref;

    @JsonCreator
    public Scale(String name,
                 String dataType,
                 String decimalPlaces,
                 String scaleDbId,
                 ValidValues validValues,
                 String xref) {
        this.name = name;
        this.dataType = dataType;
        this.decimalPlaces = decimalPlaces;
        this.scaleDbId = scaleDbId;
        this.validValues = validValues;
        this.xref = xref;
    }

    public String getName() {
        return name;
    }

    public String getDataType() {
        return dataType;
    }

    public String getDecimalPlaces() {
        return decimalPlaces;
    }

    public String getScaleDbId() {
        return scaleDbId;
    }

    public ValidValues getValidValues() {
        return validValues;
    }

    public String getXref() {
        return xref;
    }

    @Override
    public String toString() {
        return "Scale{" +
            "name='" + name + '\'' +
            ", dataType='" + dataType + '\'' +
            ", decimalPlaces='" + decimalPlaces + '\'' +
            ", scaleDbId='" + scaleDbId + '\'' +
            ", validValues=" + validValues +
            ", xref='" + xref + '\'' +
            '}';
    }
}
