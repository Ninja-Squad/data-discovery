package fr.inra.urgi.datadiscovery.harvest.rare;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.DataDiscoveryProperties;
import fr.inra.urgi.datadiscovery.dao.rare.RareDocumentDao;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import fr.inra.urgi.datadiscovery.domain.rare.RareIndexedDocument;
import fr.inra.urgi.datadiscovery.harvest.AbstractHarvester;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * The Harvester of the RARe application
 * @author JB Nizet
 */
@Component
@Profile(AppProfile.RARE)
public class RareHarvester extends AbstractHarvester<RareDocument, RareIndexedDocument> {

    public RareHarvester(DataDiscoveryProperties dataDiscoveryProperties,
						 ObjectMapper objectMapper,
						 RareDocumentDao documentDao) {
        super(dataDiscoveryProperties, objectMapper, documentDao);
    }

    @Override
    protected Class<RareDocument> getDocumentClass() {
        return RareDocument.class;
    }

    @Override
    protected RareIndexedDocument toIndexedDocument(RareDocument document) {
        return new RareIndexedDocument(document);
    }
}
