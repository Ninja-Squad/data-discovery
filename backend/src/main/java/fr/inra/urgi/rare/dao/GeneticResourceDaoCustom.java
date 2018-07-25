package fr.inra.urgi.rare.dao;

import fr.inra.urgi.rare.domain.GeneticResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Custom methods of the {@link GeneticResourceDao}
 * @author JB Nizet
 */
public interface GeneticResourceDaoCustom {

    /**
     * Searches for the given text anywhere (except in identifier, URL and numeric fields) in the genetic resources,
     * and returns the requested page (results are sorted by score, in descending order)
     */
    Page<GeneticResource> search(String query, Pageable page);
}
