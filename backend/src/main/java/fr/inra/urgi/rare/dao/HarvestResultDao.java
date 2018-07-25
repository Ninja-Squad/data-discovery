package fr.inra.urgi.rare.dao;

import fr.inra.urgi.rare.harvest.HarvestResult;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * DAO for {@link HarvestResult}
 */
public interface HarvestResultDao extends ElasticsearchRepository<HarvestResult, String>, HarvestResultDaoCustom {
}
