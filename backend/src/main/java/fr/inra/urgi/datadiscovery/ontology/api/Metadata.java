package fr.inra.urgi.datadiscovery.ontology.api;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * The Metadata of the {@link ApiResponse}
 *
 * @author JB Nizet
 */
public final class Metadata {
    private final Pagination pagination;

    @JsonCreator
    public Metadata(Pagination pagination) {
        this.pagination = pagination;
    }

    public Pagination getPagination() {
        return pagination;
    }

    @Override
    public String toString() {
        return "Metadata{" +
                "pagination=" + pagination +
                '}';
    }
}
