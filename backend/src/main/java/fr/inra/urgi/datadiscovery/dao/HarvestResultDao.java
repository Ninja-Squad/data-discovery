package fr.inra.urgi.datadiscovery.dao;

import fr.inra.urgi.datadiscovery.harvest.HarvestResult;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * DAO for {@link HarvestResult}
 */
public interface HarvestResultDao extends ElasticsearchRepository<HarvestResult, String>, HarvestResultDaoCustom {
}
