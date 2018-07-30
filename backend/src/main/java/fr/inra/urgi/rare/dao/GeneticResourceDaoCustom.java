package fr.inra.urgi.rare.dao;

import fr.inra.urgi.rare.domain.GeneticResource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;

/**
 * Custom methods of the {@link GeneticResourceDao}
 * @author JB Nizet
 */
public interface GeneticResourceDaoCustom {

    /**
     * Searches for the given text anywhere (except in identifier, URL and numeric fields) in the genetic resources,
     * and returns the requested page (results are sorted by score, in descending order).
     * @param aggregate if true, terms aggregations are requested and present in the returned value. Otherwise,
     * the returned aggregated page has no aggregation.
     */
    AggregatedPage<GeneticResource> search(String query,
                                           boolean aggregate,
                                           Pageable page);
}
