package fr.inra.urgi.datadiscovery.dto;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;

/**
 * A page of data
 *
 * @param <T> the type of data in this page
 */
public final class PageDTO<T> {
    /**
     * The maximum number of results that Elasticsearch accepts to paginate.
     */
    public static final int MAX_RESULTS = 10_000;

    /**
     * The elements in this page. Its size is less than or equal to {@link #size}
     */
    private final List<T> content;

    /**
     * The number of this page, starting from 0
     */
    private final int number;

    /**
     * The size of a page
     */
    private final int size;

    /**
     * The total number of elements
     */
    private final long totalElements;

    /**
     * The total number of pages
     */
    private final int totalPages;

    public PageDTO(List<T> content, int number, int size, long totalElements, int totalPages) {
        this.content = content;
        this.number = number;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public static <T> PageDTO<T> fromPage(Page<T> page) {
        return new PageDTO<>(page.getContent(),
                             page.getNumber(),
                             page.getSize(),
                             page.getTotalElements(),
                             Math.min(page.getTotalPages(), MAX_RESULTS / page.getSize()));
    }

    public static <T, R> PageDTO<R> fromPage(Page<T> page, Function<T, R> mapper) {
        return new PageDTO<R>(page.getContent().stream().map(mapper).collect(Collectors.toList()),
                              page.getNumber(),
                              page.getSize(),
                              page.getTotalElements(),
                              Math.min(page.getTotalPages(), MAX_RESULTS / page.getSize()));
    }

    public List<T> getContent() {
        return content;
    }

    public int getNumber() {
        return number;
    }

    public int getSize() {
        return size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public int getMaxResults() {
        return MAX_RESULTS;
    }
}
