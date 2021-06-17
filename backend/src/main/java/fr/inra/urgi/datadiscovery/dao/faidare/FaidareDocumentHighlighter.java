package fr.inra.urgi.datadiscovery.dao.faidare;

import fr.inra.urgi.datadiscovery.dao.AbstractDocumentHighlighter;
import fr.inra.urgi.datadiscovery.domain.faidare.FaidareDocument;

/**
 * The highlighter for Faidare documents
 * @author JB Nizet
 */
public class FaidareDocumentHighlighter extends AbstractDocumentHighlighter<FaidareDocument> {
    @Override
    protected FaidareDocument clone(FaidareDocument document, String newDescription) {
        return FaidareDocument.builder(document).withDescription(newDescription).build();
    }
}
