package fr.inra.urgi.rare.dao.wheatis;

import fr.inra.urgi.rare.config.AppProfile;
import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.domain.wheatis.WheatisGeneticResource;
import fr.inra.urgi.rare.domain.wheatis.WheatisIndexedGeneticResource;
import org.springframework.context.annotation.Profile;

/**
 * DAO for {@link WheatisGeneticResource}
 * @author JB Nizet
 */
@Profile(AppProfile.WHEATIS)
public interface WheatisGeneticResourceDao
    extends GeneticResourceDao<WheatisGeneticResource, WheatisIndexedGeneticResource>, WheatisGeneticResourceDaoCustom {
}
