package fr.inra.urgi.datadiscovery.domain;

import fr.inra.urgi.datadiscovery.dao.AbstractDocumentHighlighter;
import org.elasticsearch.search.aggregations.Aggregation;
import org.elasticsearch.search.aggregations.Aggregations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.SearchHitSupport;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.SearchPage;

/**
 * Interface representing a page of data with its aggregations.
 *
 * @author JB Nizet
 */
public interface AggregatedPage<D> extends Page<D> {
    Aggregation getAggregation(String name);
    Aggregations getAggregations();

    static <D extends SearchDocument> AggregatedPage<D> fromSearchHits(SearchHits<D> searchHits, Pageable pageable, AbstractDocumentHighlighter<D> highlighter) {
        SearchPage<D> searchPage = SearchHitSupport.searchPageFor(searchHits, pageable);
        Page<D> page = searchPage.map(highlighter::highlight);
        Aggregations aggregations =
            searchPage.getSearchHits().getAggregations() == null
                ? null :
                (Aggregations) searchPage.getSearchHits().getAggregations().aggregations();
        return new AggregatedPageImpl<D>(page, aggregations);
    }
}
