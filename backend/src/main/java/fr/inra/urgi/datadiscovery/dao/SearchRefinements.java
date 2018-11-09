package fr.inra.urgi.datadiscovery.dao;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * The refinements, based on aggregated values, to be added to a search
 * @author JB Nizet
 */
public final class SearchRefinements {
    public static final SearchRefinements EMPTY = SearchRefinements.builder().build();

    private final Map<AppAggregation, Set<String>> termRefinements;

    private SearchRefinements(Builder builder) {
        this.termRefinements = new HashMap<>(builder.termRefinements);
    }

    public Set<AppAggregation> getTerms() {
        return termRefinements.keySet();
    }

    public Set<String> getRefinementsForTerm(AppAggregation appAggregation) {
        return termRefinements.get(appAggregation);
    }

    public static Builder builder() {
        return new Builder();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        SearchRefinements that = (SearchRefinements) o;
        return Objects.equals(termRefinements, that.termRefinements);
    }

    @Override
    public int hashCode() {
        return Objects.hash(termRefinements);
    }

    @Override
    public String toString() {
        return "SearchRefinements{" +
            "termRefinements=" + termRefinements +
            '}';
    }

    public static final class Builder {
        private final Map<AppAggregation, Set<String>> termRefinements = new HashMap<>();

        public Builder withTerm(AppAggregation term, Collection<String> values) {
            this.termRefinements.put(term, Collections.unmodifiableSet(new HashSet<>(values)));
            return this;
        }

        public SearchRefinements build() {
            return new SearchRefinements(this);
        }
    }
}
