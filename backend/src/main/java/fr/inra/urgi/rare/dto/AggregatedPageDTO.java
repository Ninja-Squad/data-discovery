package fr.inra.urgi.rare.dto;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import fr.inra.urgi.rare.dao.AggregationAnalyzer;
import org.elasticsearch.search.aggregations.Aggregations;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;

/**
 * DTO for a page containing additional aggregations
 * @author JB Nizet
 */
public final class AggregatedPageDTO<T> {

    @JsonUnwrapped
    private final PageDTO<T> page;

    private final List<AggregationDTO> aggregations;

    public AggregatedPageDTO(PageDTO<T> page, List<AggregationDTO> aggregations) {
        this.page = page;
        this.aggregations = aggregations;
    }

    public static <T> AggregatedPageDTO<T> fromPage(AggregatedPage<T> page, AggregationAnalyzer aggregationAnalyzer) {
        return new AggregatedPageDTO<>(
            PageDTO.fromPage(page),
            toAggregationDTOs(page.getAggregations(), aggregationAnalyzer));
    }

    public static <T, R> AggregatedPageDTO<R> fromPage(AggregatedPage<T> page,
                                                       AggregationAnalyzer aggregationAnalyzer,
                                                       Function<T, R> mapper) {
        return new AggregatedPageDTO<>(
            PageDTO.fromPage(page, mapper),
            toAggregationDTOs(page.getAggregations(), aggregationAnalyzer));
    }

    private static List<AggregationDTO> toAggregationDTOs(Aggregations aggregations,
                                                          AggregationAnalyzer aggregationAnalyzer) {
        if (aggregations == null) {
            return Collections.emptyList();
        }
        return aggregations.asList()
                           .stream()
                           .filter(aggregation -> aggregation instanceof Terms)
                           .map(Terms.class::cast)
                           .sorted(aggregationAnalyzer.comparator())
                           .map(terms -> new AggregationDTO(terms, aggregationAnalyzer))
                           .collect(Collectors.toList());
    }

    public PageDTO<T> getPage() {
        return page;
    }

    public List<AggregationDTO> getAggregations() {
        return aggregations;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        AggregatedPageDTO<?> that = (AggregatedPageDTO<?>) o;
        return Objects.equals(page, that.page) &&
            Objects.equals(aggregations, that.aggregations);
    }

    @Override
    public int hashCode() {
        return Objects.hash(page, aggregations);
    }

    @Override
    public String toString() {
        return "AggregatedPageDTO{" +
            "page=" + page +
            ", aggregations=" + aggregations +
            '}';
    }
}
