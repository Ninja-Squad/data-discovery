package fr.inra.urgi.datadiscovery.harvest.wheatis;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.DataDiscoveryProperties;
import fr.inra.urgi.datadiscovery.dao.wheatis.WheatisDocumentDao;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisDocument;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisIndexedDocument;
import fr.inra.urgi.datadiscovery.harvest.AbstractHarvester;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * The Harvester of the WheatIS application
 * @author JB Nizet
 */
@Component
@Profile({AppProfile.WHEATIS, AppProfile.GNPIS})
public class WheatisHarvester extends AbstractHarvester<WheatisDocument, WheatisIndexedDocument> {

    public WheatisHarvester(DataDiscoveryProperties dataDiscoveryProperties,
							ObjectMapper objectMapper,
							WheatisDocumentDao documentDao) {
        super(dataDiscoveryProperties, objectMapper, documentDao);
    }

    @Override
    protected Class<WheatisDocument> getDocumentClass() {
        return WheatisDocument.class;
    }

    @Override
    protected WheatisIndexedDocument toIndexedDocument(WheatisDocument document) {
        return new WheatisIndexedDocument(document);
    }
}
