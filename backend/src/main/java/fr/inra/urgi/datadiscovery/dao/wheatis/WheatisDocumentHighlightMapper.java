package fr.inra.urgi.datadiscovery.dao.wheatis;

import fr.inra.urgi.datadiscovery.dao.AbstractDocumentHighlightMapper;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisDocument;
import org.springframework.data.elasticsearch.core.EntityMapper;
import org.springframework.data.elasticsearch.core.SearchResultMapper;

/**
 * A special {@link SearchResultMapper}, only usable for {@link WheatisDocument}, which delegates to the
 * default mapper, but then replaces the description in the mapped documents by the highlighted description
 * if it's found in the search response.
 * @author JB Nizet
 */
public class WheatisDocumentHighlightMapper
    extends AbstractDocumentHighlightMapper<WheatisDocument> {

    public WheatisDocumentHighlightMapper(EntityMapper entityMapper) {
        super(entityMapper);
    }

    @Override
    protected Class<WheatisDocument> getDocumentClass() {
        return WheatisDocument.class;
    }

    @Override
    protected WheatisDocument clone(WheatisDocument document, String newDescription) {
        return WheatisDocument.builder(document).withDescription(newDescription).build();
    }
}
