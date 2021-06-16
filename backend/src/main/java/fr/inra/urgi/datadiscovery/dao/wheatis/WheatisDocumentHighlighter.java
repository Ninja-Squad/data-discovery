package fr.inra.urgi.datadiscovery.dao.wheatis;

import fr.inra.urgi.datadiscovery.dao.AbstractDocumentHighlighter;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisDocument;

/**
 * The highlighter for WheatIS documents
 * @author JB Nizet
 */
public class WheatisDocumentHighlighter extends AbstractDocumentHighlighter<WheatisDocument> {
    @Override
    protected WheatisDocument clone(WheatisDocument document, String newDescription) {
        return WheatisDocument.builder(document).withDescription(newDescription).build();
    }
}
