package fr.inra.urgi.rare.dao.rare;

import fr.inra.urgi.rare.config.AppProfile;
import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.domain.rare.RareGeneticResource;
import fr.inra.urgi.rare.domain.rare.RareIndexedGeneticResource;
import org.springframework.context.annotation.Profile;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * DAO for {@link RareGeneticResource}
 */
@Profile(AppProfile.RARE)
public interface RareGeneticResourceDao
    extends GeneticResourceDao<RareGeneticResource, RareIndexedGeneticResource>,
            ElasticsearchRepository<RareGeneticResource, String>,
            RareGeneticResourceDaoCustom {
}
