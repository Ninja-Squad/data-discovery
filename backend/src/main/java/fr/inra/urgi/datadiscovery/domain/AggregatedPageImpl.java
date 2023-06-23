package fr.inra.urgi.datadiscovery.domain;

import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import fr.inra.urgi.datadiscovery.dto.AggregationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Implementation of {@link AggregatedPage}
 * @author JB Nizet
 */
public class AggregatedPageImpl<T> implements AggregatedPage<T> {
    private final Page<T> delegate;
    private final Map<String, AggregationDTO> aggregations;

    public AggregatedPageImpl(List<T> content, Pageable pageable, long total) {
        this(content, pageable, total, Collections.emptyList());

    }

    public AggregatedPageImpl(List<T> content, Pageable pageable, long total, Collection<AggregationDTO> aggregations) {
        this(new PageImpl<>(content, pageable, total), aggregations);
    }

    public AggregatedPageImpl(Page<T> delegate, Collection<AggregationDTO> aggregations) {
        this.delegate = delegate;
        this.aggregations = aggregations.stream()
                                        .collect(Collectors.toUnmodifiableMap(
                                            AggregationDTO::getName,
                                            Function.identity()
                                        ));
    }

    @Override
    public AggregationDTO getAggregation(String name) {
        return this.aggregations.get(name);
    }

    @Override
    public Collection<AggregationDTO> getAggregations() {
        return this.aggregations.values();
    }

    @Override
    public int getTotalPages() {
        return delegate.getTotalPages();
    }

    @Override
    public long getTotalElements() {
        return delegate.getTotalElements();
    }

    @Override
    public <U> Page<U> map(Function<? super T, ? extends U> converter) {
        return delegate.map(converter);
    }

    @Override
    public int getNumber() {
        return delegate.getNumber();
    }

    @Override
    public int getSize() {
        return delegate.getSize();
    }

    @Override
    public int getNumberOfElements() {
        return delegate.getNumberOfElements();
    }

    @Override
    public List<T> getContent() {
        return delegate.getContent();
    }

    @Override
    public boolean hasContent() {
        return delegate.hasContent();
    }

    @Override
    public Sort getSort() {
        return delegate.getSort();
    }

    @Override
    public boolean isFirst() {
        return delegate.isFirst();
    }

    @Override
    public boolean isLast() {
        return delegate.isLast();
    }

    @Override
    public boolean hasNext() {
        return delegate.hasNext();
    }

    @Override
    public boolean hasPrevious() {
        return delegate.hasPrevious();
    }

    @Override
    public Pageable nextPageable() {
        return delegate.nextPageable();
    }

    @Override
    public Pageable previousPageable() {
        return delegate.previousPageable();
    }

    @Override
    public Iterator<T> iterator() {
        return delegate.iterator();
    }
}
