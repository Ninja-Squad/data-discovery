package fr.inra.urgi.datadiscovery.dao.rare;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import org.springframework.context.annotation.Profile;

/**
 * DAO for {@link RareDocument}
 */
@Profile({AppProfile.RARE, AppProfile.BRC4ENV})
public interface RareDocumentDao extends DocumentDao<RareDocument>, RareDocumentDaoCustom {
}
