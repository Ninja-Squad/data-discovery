package fr.inra.urgi.rare.dto;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.elasticsearch.search.aggregations.bucket.terms.Terms;

/**
 * A DTO for a terms aggregation, containing the name of the aggregation (which is used to determine the aggregated
 * field), and the various buckets, i.e. the various values of this field.
 * @author JB Nizet
 */
public final class AggregationDTO {
    private final String name;
    private final List<BucketDTO> buckets;

    public AggregationDTO(Terms aggregation) {
        this.name = aggregation.getName();
        this.buckets = Collections.unmodifiableList(
            aggregation.getBuckets().stream().map(BucketDTO::new).collect(Collectors.toList())
        );
    }

    public String getName() {
        return name;
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
