package fr.inra.urgi.datadiscovery.dao;

import java.util.Collection;
import java.util.List;

import fr.inra.urgi.datadiscovery.domain.AggregatedPage;
import fr.inra.urgi.datadiscovery.domain.SearchDocument;
import fr.inra.urgi.datadiscovery.domain.SuggestionDocument;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.springframework.data.domain.Pageable;

/**
 * Base custom interface for document DAOs
 * @author JB Nizet
 */
public interface DocumentDaoCustom<D extends SearchDocument> {
    /**
     * Searches for the given text anywhere (except typically in the identifier, the URL and numeric fields) in the
     * documents, and returns the requested page (results are sorted by score, in descending order).
     */
    AggregatedPage<D> search(String query,
                             boolean highlight,
                             boolean descendants,
                             SearchRefinements refinements,
                             Pageable page);

    /** Aggregates and return an empty result based on the given text anywhere (except typically in the identifier, the URL and numeric fields) in the
     * documents, and returns the requested page (results are sorted by score, in descending order).
     * Separation from the search method for performances reasons
     */
    AggregatedPage<D> aggregate(String query, SearchRefinements refinements, boolean descendants);

    /**
     * Suggests completions for the given term. It typically autocompletes all the fields except the identifier, the URL and
     * numeric fields.
     * @return The 10 first suggested completions
     */
    List<String> suggest(String term);

    /**
     * Saves all the given suggestions.
     * @param suggestions
     */
    void saveAllSuggestions(Collection<SuggestionDocument> suggestions);

    /**
     * Deletes all suggestions.
     */
    void deleteAllSuggestions();

    /**
     * Finds the pillars terms aggregation.
     * The returned aggregation has one bucket per pillar name.
     * Each of these buckets has a Terms aggregation named {@link DocumentDao#DATABASE_SOURCE_AGGREGATION_NAME}.
     * Each bucket of each database source aggregation <strong>may</strong> have in turn an aggregation named
     * {@link DocumentDao#PORTAL_URL_AGGREGATION_NAME}. If this last aggregation is present, then it can have 0
     * or 1 (or more, but this shows a problem in the data) bucket containing the URL of the database source.
     */
    Terms findPillars();

    void refresh();
}
