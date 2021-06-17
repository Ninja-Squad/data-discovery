package fr.inra.urgi.datadiscovery.dao;

import fr.inra.urgi.datadiscovery.domain.SearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.repository.NoRepositoryBean;

/**
 * Interface common to all document DAOs. There is one specific sub-interface for each app: one for RARe, one
 * for WheatIS, etc.
 * @author JB Nizet
 */
@NoRepositoryBean
public interface DocumentDao<D extends SearchDocument> extends ElasticsearchRepository<D, String>, DocumentDaoCustom<D> {
    String DATABASE_SOURCE_AGGREGATION_NAME = "databaseSource";
    String PORTAL_URL_AGGREGATION_NAME = "portalURL";
}
