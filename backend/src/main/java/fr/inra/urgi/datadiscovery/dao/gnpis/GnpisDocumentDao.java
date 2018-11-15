package fr.inra.urgi.datadiscovery.dao.gnpis;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import fr.inra.urgi.datadiscovery.domain.gnpis.GnpisDocument;
import fr.inra.urgi.datadiscovery.domain.gnpis.GnpisIndexedDocument;
import org.springframework.context.annotation.Profile;

/**
 * DAO for {@link GnpisDocument}
 * @author JB Nizet
 */
@Profile(AppProfile.GNPIS)
public interface GnpisDocumentDao
    extends DocumentDao<GnpisDocument, GnpisIndexedDocument>, GnpisDocumentDaoCustom {
}
