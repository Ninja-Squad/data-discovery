package fr.inra.urgi.datadiscovery.ontology.api;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.List;

/**
 * The ValidValues of a {@link Scale}
 *
 * @author JB Nizet
 */
public class ValidValues {
    private final List<String> categories;
    private final double max;
    private final double min;

    @JsonCreator
    public ValidValues(List<String> categories, double max, double min) {
        this.categories = categories == null ? List.of() : List.copyOf(categories);
        this.max = max;
        this.min = min;
    }

    public List<String> getCategories() {
        return categories;
    }

    public double getMax() {
        return max;
    }

    public double getMin() {
        return min;
    }

    @Override
    public String toString() {
        return "ValidValues{" +
            "categories=" + categories +
            ", max=" + max +
            ", min=" + min +
            '}';
    }
}
