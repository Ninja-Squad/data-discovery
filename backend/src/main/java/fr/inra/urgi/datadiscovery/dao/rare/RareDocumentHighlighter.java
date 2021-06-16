package fr.inra.urgi.datadiscovery.dao.rare;

import fr.inra.urgi.datadiscovery.dao.AbstractDocumentHighlighter;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;

/**
 * The highlighter for Rare documents
 * @author JB Nizet
 */
public class RareDocumentHighlighter extends AbstractDocumentHighlighter<RareDocument> {

    @Override
    protected RareDocument clone(RareDocument document, String newDescription) {
        return RareDocument.builder(document).withDescription(newDescription).build();
    }
}
