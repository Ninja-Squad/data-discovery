package fr.inra.urgi.datadiscovery.dto;

import java.util.List;
import java.util.Objects;

import co.elastic.clients.elasticsearch._types.aggregations.StringTermsAggregate;
import fr.inra.urgi.datadiscovery.dao.AggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.AppAggregation;

/**
 * A DTO for a terms aggregation, containing the name of the aggregation (which is used to determine the aggregated
 * field), and the various buckets, i.e. the various values of this field.
 * @author JB Nizet
 */
public final class AggregationDTO {
    /**
     * The name of the aggregation, used in the frontend to know which label to display for this aggregation,
     * and also used as a query parameter when querying with a value for that aggregation
     */
    private final String name;

    /**
     * The type of the aggregation, used in the frontend to know how to display that aggregation: as
     * a list of checkboxes (type SMALL) or as a typeahead to enter values (type LARGE)
     */
    private final AppAggregation.Type type;

    /**
     * The buckets of the aggregation, each containing one of the values, and the number of documents
     * selected by the query that fall into that bucket
     */
    private final List<BucketDTO> buckets;

    public AggregationDTO(String name, AppAggregation.Type type, List<BucketDTO> buckets) {
        this.name = name;
        this.type = type;
        this.buckets = List.copyOf(buckets);
    }

    public AggregationDTO(String name, StringTermsAggregate aggregation, AggregationAnalyzer aggregationAnalyzer) {
        this.name = name;
        this.type = aggregationAnalyzer.getAggregationType(name);
        this.buckets = aggregation.buckets()
                                  .array()
                                  .stream()
                                  .map(bucket -> new BucketDTO(bucket.key().stringValue(), bucket.docCount()))
                                  .toList();
    }

    public String getName() {
        return name;
    }

    public AppAggregation.Type getType() {
        return type;
    }

    public List<BucketDTO> getBuckets() {
        return buckets;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        AggregationDTO that = (AggregationDTO) o;
        return Objects.equals(name, that.name) &&
            Objects.equals(buckets, that.buckets);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, buckets);
    }

    @Override
    public String toString() {
        return "AggregationDTO{" +
            "name='" + name + '\'' +
            ", buckets=" + buckets +
            '}';
    }
}
