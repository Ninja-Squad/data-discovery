package fr.inra.urgi.rare.dao;

import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.domain.IndexedGeneticResource;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.repository.NoRepositoryBean;

/**
 * Interface common to all genetic resource DAOs. There is one specific sub-interface for each app: one for RARe, one
 * for WheatIS, etc.
 * @author JB Nizet
 */
@NoRepositoryBean
public interface GeneticResourceDao<R extends GeneticResource, I extends IndexedGeneticResource<R>>
    extends ElasticsearchRepository<R, String>,
    GeneticResourceDaoCustom<R, I> {

    String DATABASE_SOURCE_AGGREGATION_NAME = "databaseSource";
    String PORTAL_URL_AGGREGATION_NAME = "portalURL";
}
