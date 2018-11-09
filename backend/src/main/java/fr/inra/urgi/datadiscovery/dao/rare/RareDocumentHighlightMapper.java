package fr.inra.urgi.datadiscovery.dao.rare;

import fr.inra.urgi.datadiscovery.dao.AbstractDocumentHighlightMapper;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import org.springframework.data.elasticsearch.core.EntityMapper;
import org.springframework.data.elasticsearch.core.SearchResultMapper;

/**
 * A special {@link SearchResultMapper}, only usable for {@link RareDocument}, which delegates to the
 * default mapper, but then replaces the description in the mapped documents by the highlighted description
 * if it's found in the search response.
 * @author JB Nizet
 */
public class RareDocumentHighlightMapper
    extends AbstractDocumentHighlightMapper<RareDocument> {

    public RareDocumentHighlightMapper(EntityMapper entityMapper) {
        super(entityMapper);
    }

    @Override
    protected Class<RareDocument> getDocumentClass() {
        return RareDocument.class;
    }

    @Override
    protected RareDocument clone(RareDocument document, String newDescription) {
        return RareDocument.builder(document).withDescription(newDescription).build();
    }
}
