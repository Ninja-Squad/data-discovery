package fr.inra.urgi.datadiscovery.dao.wheatis;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisDocument;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisIndexedDocument;
import org.springframework.context.annotation.Profile;

/**
 * DAO for {@link WheatisDocument}
 * @author JB Nizet
 */
@Profile(AppProfile.WHEATIS)
public interface WheatisDocumentDao
    extends DocumentDao<WheatisDocument, WheatisIndexedDocument>, WheatisDocumentDaoCustom {
}
