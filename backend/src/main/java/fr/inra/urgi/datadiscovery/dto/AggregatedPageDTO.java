package fr.inra.urgi.datadiscovery.dto;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import fr.inra.urgi.datadiscovery.dao.AggregationAnalyzer;
import fr.inra.urgi.datadiscovery.domain.AggregatedPage;

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

    public static <T> AggregatedPageDTO<T> fromPage(AggregatedPage<T> page,
                                                    AggregationAnalyzer aggregationAnalyzer) {
        return new AggregatedPageDTO<>(
            PageDTO.fromPage(page),
            toAggregationDTOs(page.getAggregations(), aggregationAnalyzer));
    }

    private static List<AggregationDTO> toAggregationDTOs(Collection<AggregationDTO> aggregations,
                                                          AggregationAnalyzer aggregationAnalyzer) {
        if (aggregations == null) {
            return Collections.emptyList();
        }
        return aggregations.stream()
                           .sorted(aggregationAnalyzer.comparator())
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
