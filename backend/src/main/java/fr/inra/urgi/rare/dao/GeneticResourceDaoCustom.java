package fr.inra.urgi.rare.dao;

import java.util.Collection;
import java.util.List;

import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.domain.IndexedGeneticResource;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;

/**
 * Custom methods of the {@link GeneticResourceDao}
 * @author JB Nizet
 */
public interface GeneticResourceDaoCustom {

    String DATABASE_SOURCE_AGGREGATION_NAME = "databaseSource";
    String PORTAL_URL_AGGREGATION_NAME = "portalURL";

    /**
     * Searches for the given text anywhere (except in identifier, URL and numeric fields) in the genetic resources,
     * and returns the requested page (results are sorted by score, in descending order).
     * @param aggregate if true, terms aggregations are requested and present in the returned value. Otherwise,
     * the returned aggregated page has no aggregation.
     */
    AggregatedPage<GeneticResource> search(String query,
                                           boolean aggregate,
                                           SearchRefinements refinements,
                                           Pageable page);

    /**
     * Suggests completions for the given term. It autocompletes all the fields except the identifier, the URL and
     * numeric fields, and the description.
     * @return The N first distinct suggested completions
     */
    List<String> suggest(String term);

    /**
     * Saves all the given genetic resources given as argument. Since {@link IndexedGeneticResource} is in fact the
     * same document as {@link GeneticResource}, but with an additional computed field used only to enable suggestions
     * implementation, and used only when saving the entities, this method has been added to the
     * {@link GeneticResourceDao} as a custom method instead of creating a whole DAO only for thsi "fake" document:
     * we don't want to encourage doing anything other than saving {@link IndexedGeneticResource} instances, which
     * a specific DAO would do.
     */
    void saveAll(Collection<IndexedGeneticResource> indexedGeneticResources);

    Terms findPillars();
}
