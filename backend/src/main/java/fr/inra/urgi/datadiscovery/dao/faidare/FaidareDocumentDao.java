package fr.inra.urgi.datadiscovery.dao.faidare;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import fr.inra.urgi.datadiscovery.domain.faidare.FaidareDocument;
import org.springframework.context.annotation.Profile;

/**
 * DAO for {@link FaidareDocument}
 * @author JB Nizet
 */
@Profile({AppProfile.FAIDARE})
public interface FaidareDocumentDao extends DocumentDao<FaidareDocument>, FaidareDocumentDaoCustom {
}
