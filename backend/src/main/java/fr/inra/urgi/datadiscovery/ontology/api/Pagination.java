package fr.inra.urgi.datadiscovery.ontology.api;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * The Pagination of the {@link Metadata}
 *
 * @author JB Nizet
 */
public final class Pagination {
    private final int currentPage;
    private final int pageSize;
    private final int totalCount;
    private final int totalPages;

    @JsonCreator
    public Pagination(int currentPage, int pageSize, int totalCount, int totalPages) {
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalCount = totalCount;
        this.totalPages = totalPages;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public int getPageSize() {
        return pageSize;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public int getTotalPages() {
        return totalPages;
    }

    @Override
    public String toString() {
        return "Pagination{" +
                "currentPage=" + currentPage +
                ", pageSize=" + pageSize +
                ", totalCount=" + totalCount +
                ", totalPages=" + totalPages +
                '}';
    }
}
