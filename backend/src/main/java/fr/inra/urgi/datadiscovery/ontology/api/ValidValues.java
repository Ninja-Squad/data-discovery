package fr.inra.urgi.datadiscovery.ontology.api;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * The ValidValues of a {@link Scale}
 *
 * @author JB Nizet
 */
public class ValidValues {
    private final List<String> categories;
    private final Double max;
    private final Double min;

    @JsonCreator
    public ValidValues(List<String> categories, Double min, Double max) {
        this.categories = categories == null ? List.of() : List.copyOf(categories);
        this.max = max;
        this.min = min;
    }

    public List<String> getCategories() {
        return categories;
    }

    public Double getMax() {
        return max;
    }

    public Double getMin() {
        return min;
    }

    @Override
    public String toString() {
        return "ValidValues{" +
            "categories=" + categories +
            ", min=" + min +
            ", max=" + max +
            '}';
    }
}
