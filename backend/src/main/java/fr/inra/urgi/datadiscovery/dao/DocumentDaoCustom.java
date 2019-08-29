package fr.inra.urgi.datadiscovery.dao;

import java.util.Collection;
import java.util.List;

import fr.inra.urgi.datadiscovery.domain.SearchDocument;
import fr.inra.urgi.datadiscovery.domain.IndexedDocument;
import fr.inra.urgi.datadiscovery.domain.SuggestionDocument;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;

/**
 * Base custom interface for document DAOs
 * @author JB Nizet
 */
public interface DocumentDaoCustom<D extends SearchDocument, I extends IndexedDocument<D>> {
    /**
     * Searches for the given text anywhere (except typically in the identifier, the URL and numeric fields) in the
     * documents, and returns the requested page (results are sorted by score, in descending order).
     * @param aggregate if true, terms aggregations are requested and present in the returned value. Otherwise,
     * the returned aggregated page has no aggregation.
     */
    AggregatedPage<D> search(String query,
                             boolean aggregate,
                             boolean highlight,
                             SearchRefinements refinements,
                             Pageable page);

    /**
     * Suggests completions for the given term. It typically autocompletes all the fields except the identifier, the URL and
     * numeric fields.
     * @return The 10 first suggested completions
     */
    List<String> suggest(String term);

    /**
     * Saves all the given documents given as argument. Since {@link IndexedDocument} is in fact the
     * same document as {@link SearchDocument}, but with an additional computed field used only to enable suggestions
     * implementation, and used only when saving the entities, this method has been added to the
     * {@link DocumentDao} as a custom method instead of creating a whole DAO only for this "fake" document:
     * we don't want to encourage doing anything other than saving {@link IndexedDocument} instances, which
     * a specific DAO would do.
     */
    @Deprecated
    void saveAll(Collection<I> indexedDocuments);

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

    /**
     * Puts the mapping for the alias of the {@link IndexedDocument} document
     */
    @Deprecated
    void putMapping();
}
