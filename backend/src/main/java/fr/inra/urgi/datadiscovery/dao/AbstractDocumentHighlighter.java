package fr.inra.urgi.datadiscovery.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import fr.inra.urgi.datadiscovery.domain.SearchDocument;
import org.elasticsearch.search.fetch.subphase.highlight.HighlightField;
import org.springframework.data.elasticsearch.core.SearchHit;

/**
 * A base class for a document highlighter, whose responsibility is to take a document and create a highlighted version
 * of that document based on the highlights found in the search hits.
 * There is one subclass for each app (RARe, WheatIS, etc.)
 * @author JB Nizet
 */
public abstract class AbstractDocumentHighlighter<D extends SearchDocument> {

    public D highlight(SearchHit<D> hit) {
        D document = hit.getContent();
        Map<String, List<String>> highlightFields = hit.getHighlightFields();

        String newDescription = document.getDescription();
        boolean hightlightFound = false;

        List<String> descriptionHighlight = highlightFields.get("description");
        if (descriptionHighlight != null && descriptionHighlight.size() == 1) {
            newDescription = descriptionHighlight.get(0);
            hightlightFound = true;
        }
        List<String> descriptionSynonymsHighlight = highlightFields.get("description.synonyms");
        if (descriptionSynonymsHighlight != null && descriptionSynonymsHighlight.size() == 1) {
            newDescription = descriptionSynonymsHighlight.get(0);
            hightlightFound = true;
        }

        if (hightlightFound) {
            return clone(document, newDescription);
        } else {
            return document;
        }
    }

    protected abstract D clone(D original, String newDescription);
}

