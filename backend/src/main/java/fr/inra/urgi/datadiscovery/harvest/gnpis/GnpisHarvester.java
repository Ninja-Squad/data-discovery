package fr.inra.urgi.datadiscovery.harvest.gnpis;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.DataDiscoveryProperties;
import fr.inra.urgi.datadiscovery.dao.gnpis.GnpisDocumentDao;
import fr.inra.urgi.datadiscovery.domain.gnpis.GnpisDocument;
import fr.inra.urgi.datadiscovery.domain.gnpis.GnpisIndexedDocument;
import fr.inra.urgi.datadiscovery.harvest.AbstractHarvester;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * The Harvester of the Gnpis application
 * @author JB Nizet
 */
@Component
@Profile(AppProfile.GNPIS)
public class GnpisHarvester extends AbstractHarvester<GnpisDocument, GnpisIndexedDocument> {

    public GnpisHarvester(DataDiscoveryProperties dataDiscoveryProperties,
							ObjectMapper objectMapper,
							GnpisDocumentDao documentDao) {
        super(dataDiscoveryProperties, objectMapper, documentDao);
    }

    @Override
    protected Class<GnpisDocument> getDocumentClass() {
        return GnpisDocument.class;
    }

    @Override
    protected GnpisIndexedDocument toIndexedDocument(GnpisDocument document) {
        return new GnpisIndexedDocument(document);
    }
}
