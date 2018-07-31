package fr.inra.urgi.rare.dao;

import static fr.inra.urgi.rare.dao.RareAggregation.Type.LARGE;
import static fr.inra.urgi.rare.dao.RareAggregation.Type.SMALL;

import java.util.stream.Stream;

/**
 * Enum listing the terms aggregations used by RARe, and their corresponding name and field
 * @author JB Nizet
 */
public enum RareAggregation {
    DOMAIN("domain", "domain.keyword", SMALL),
    BIOTOPE("biotope", "biotopeType.keyword", SMALL),
    MATERIAL("material", "materialType.keyword", SMALL),
    COUNTRY_OF_ORIGIN("coo", "countryOfOrigin.keyword", SMALL),
    TAXON("taxon", "taxon.keyword", LARGE);

    private final String name;
    private final String field;
    private final Type type;

    RareAggregation(String name, String field, Type type) {
        this.name = name;
        this.field = field;
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public String getField() {
        return field;
    }

    public Type getType() {
        return type;
    }

    public static RareAggregation fromName(String name) {
        return Stream.of(RareAggregation.values())
                     .filter(ra -> ra.getName().equals(name))
                     .findAny()
                     .orElseThrow(() -> new IllegalArgumentException("Unknown RareAggregation name: " + name));
    }

    /**
     * The type of an aggregation. On the server, it's used to know what is the maximum number of buckets to
     * retrieve. On the client, it's used to know if the aggregation must be displayed using a list of checkbowes to
     * choose from, or using a typeahead which will allow adding choices among the potentially large number of results
     */
    public enum Type {
        SMALL(100),
        LARGE(2000);

        private final int maxBuckets;

        Type(int maxBuckets) {
            this.maxBuckets = maxBuckets;
        }

        public int getMaxBuckets() {
            return maxBuckets;
        }
    }
}
