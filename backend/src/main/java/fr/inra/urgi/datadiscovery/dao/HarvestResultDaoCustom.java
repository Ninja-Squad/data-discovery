package fr.inra.urgi.datadiscovery.dao;

import fr.inra.urgi.datadiscovery.harvest.HarvestResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Custom methods of {@link HarvestResultDao}
 * @author JB Nizet
 */
public interface HarvestResultDaoCustom {

    /**
     * Lists the {@link HarvestResult} of the given page, sorted by start instant, in descending order (most recent
     * first).
     * @return a page of <strong>partial</strong> {@link HarvestResult} instances, containing only the ID, start instant
     * and end instant.
     */
    Page<HarvestResult> list(Pageable page);
}
