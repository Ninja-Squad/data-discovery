package fr.inra.urgi.datadiscovery.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import fr.inra.urgi.datadiscovery.domain.Document;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.fetch.subphase.highlight.HighlightField;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.DefaultResultMapper;
import org.springframework.data.elasticsearch.core.EntityMapper;
import org.springframework.data.elasticsearch.core.SearchResultMapper;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;
import org.springframework.data.elasticsearch.core.aggregation.impl.AggregatedPageImpl;

/**
 * A base class for highlight mappers. There is one subclass for each app (RARe, WheatIS, etc.)
 * @author JB Nizet
 */
public abstract class AbstractDocumentHighlightMapper<R extends Document>
    implements SearchResultMapper {

    private DefaultResultMapper defaultResultMapper;

    public AbstractDocumentHighlightMapper(EntityMapper entityMapper) {
        this.defaultResultMapper = new DefaultResultMapper(entityMapper);
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T> AggregatedPage<T> mapResults(SearchResponse response, Class<T> clazz, Pageable pageable) {
        if (clazz != getDocumentClass()) {
            throw new IllegalArgumentException("The only supported class is " + getDocumentClass());
        }

        AggregatedPage<R> page = defaultResultMapper.mapResults(response, getDocumentClass(), pageable);

        List<R> newContent = new ArrayList<>(page.getContent());

        for (int i = 0; i < page.getContent().size(); i++) {
            R document = page.getContent().get(i);
            SearchHit hit = response.getHits().getAt(i);
            Map<String, HighlightField> highlightFields = hit.getHighlightFields();

            String newDescription = document.getDescription();
            boolean hightlightFound = false;

            if (highlightFields != null) {
                HighlightField descriptionHighlight = highlightFields.get("description");
                if (descriptionHighlight != null && descriptionHighlight.getFragments().length == 1) {
                    newDescription = descriptionHighlight.getFragments()[0].string();
                    hightlightFound = true;
                }
            }

            if (hightlightFound) {
                R newDocument = clone(document, newDescription);
                newContent.set(i, newDocument);
            }
        }

        return (AggregatedPage<T>) new AggregatedPageImpl<>(newContent,
                                                            page.getPageable(),
                                                            page.getTotalElements(),
                                                            page.getAggregations(),
                                                            page.getScrollId());
    }

    protected abstract Class<R> getDocumentClass();
    protected abstract R clone(R original, String newDescription);
}

