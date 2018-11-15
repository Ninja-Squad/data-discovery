package fr.inra.urgi.datadiscovery.dao.gnpis;

import fr.inra.urgi.datadiscovery.dao.AbstractDocumentHighlightMapper;
import fr.inra.urgi.datadiscovery.domain.gnpis.GnpisDocument;
import org.springframework.data.elasticsearch.core.EntityMapper;
import org.springframework.data.elasticsearch.core.SearchResultMapper;

/**
 * A special {@link SearchResultMapper}, only usable for {@link GnpisDocument}, which delegates to the
 * default mapper, but then replaces the description in the mapped documents by the highlighted description
 * if it's found in the search response.
 * @author JB Nizet
 */
public class GnpisDocumentHighlightMapper
    extends AbstractDocumentHighlightMapper<GnpisDocument> {

    public GnpisDocumentHighlightMapper(EntityMapper entityMapper) {
        super(entityMapper);
    }

    @Override
    protected Class<GnpisDocument> getDocumentClass() {
        return GnpisDocument.class;
    }

    @Override
    protected GnpisDocument clone(GnpisDocument document, String newDescription) {
        return GnpisDocument.builder(document).withDescription(newDescription).build();
    }
}
