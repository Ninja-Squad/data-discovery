package fr.inra.urgi.datadiscovery.dao;

import fr.inra.urgi.datadiscovery.domain.SearchDocument;

/**
 * Common interface to all aggregation types. Each application (RARe, WheatIS, etc.) typically defines an enum
 * which implements this interface and defines the ordered list of aggregations for this app.
 * @author JB Nizet
 */
public interface AppAggregation {

    /**
     * Returns the name of the aggregation, which identifies it among all the aggregations of the same app.
     */
    String getName();

    /**
     * Returns the field of the aggregation, on which the aggregation is made. It's typically a keyword field
     * of the {@link SearchDocument} class of the app
     */
    String getField();

    /**
     * Returns the type of the aggregation
     */
    Type getType();

    /**
     * The type of an aggregation. On the server, it's used to know what is the maximum number of buckets to
     * retrieve. On the client, it's used to know if the aggregation must be displayed using a list of checkboxes to
     * choose from, or using a typeahead which will allow adding choices among the potentially large number of results:
     * - if the type is ONTOLOGY, then a modal dialog is used to select variables in the ontology tree
     * - if the type is LARGE and there are at least 10 buckets, then a typeahead is used
     * - otherwise, checkboxes are used
     * So SMALL should really only be used if there is a guarantee that the number of buckets is really small
     */
    public enum Type {
        SMALL(100),
        LARGE(2000),
        ONTOLOGY(2000);

        private final int maxBuckets;

        Type(int maxBuckets) {
            this.maxBuckets = maxBuckets;
        }

        public int getMaxBuckets() {
            return maxBuckets;
        }
    }
}
