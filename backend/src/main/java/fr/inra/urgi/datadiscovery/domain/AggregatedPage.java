package fr.inra.urgi.datadiscovery.domain;

import java.util.Collection;

import co.elastic.clients.elasticsearch._types.aggregations.Aggregate;
import co.elastic.clients.elasticsearch._types.aggregations.StringTermsAggregate;
import fr.inra.urgi.datadiscovery.dao.AbstractDocumentHighlighter;
import fr.inra.urgi.datadiscovery.dao.AggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dto.AggregationDTO;
import fr.inra.urgi.datadiscovery.dto.BucketDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.Aggregation;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregations;
import org.springframework.data.elasticsearch.core.SearchHitSupport;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.SearchPage;

/**
 * Interface representing a page of data with its aggregations.
 *
 * @author JB Nizet
 */
public interface AggregatedPage<D> extends Page<D> {
    AggregationDTO getAggregation(String name);
    Collection<AggregationDTO> getAggregations();

    static <D extends SearchDocument> AggregatedPage<D> fromSearchHits(
        SearchHits<D> searchHits,
        Pageable pageable,
        AggregationAnalyzer aggregationAnalyzer,
        AbstractDocumentHighlighter<D> highlighter
    ) {
        SearchPage<D> searchPage = SearchHitSupport.searchPageFor(searchHits, pageable);
        Page<D> page = searchPage.map(highlighter::highlight);
        ElasticsearchAggregations aggregations =
            searchPage.getSearchHits().getAggregations() == null
                ? null :
                (ElasticsearchAggregations) searchPage.getSearchHits().getAggregations();
        return new AggregatedPageImpl<D>(
            page,
            aggregations.aggregationsAsMap()
                        .values()
                        .stream()
                        .map(elasticsearchAggregation -> createAggregationDTO(elasticsearchAggregation.aggregation(), aggregationAnalyzer))
                        .toList()
        );
    }

    private static AggregationDTO createAggregationDTO(Aggregation aggregation, AggregationAnalyzer aggregationAnalyzer) {
        if (aggregation.getAggregate().isSterms()) {
            return new AggregationDTO(aggregation.getName(), aggregation.getAggregate().sterms(), aggregationAnalyzer);
        } else if (aggregation.getAggregate().isFilter()) {
            Aggregate subAggregate = aggregation.getAggregate().filter().aggregations().get(aggregation.getName());
            if (subAggregate.isSterms()) {
                return new AggregationDTO(aggregation.getName(), subAggregate.sterms(), aggregationAnalyzer);
            } else {
                throw new IllegalArgumentException("Unhandled type of aggregation");
            }
        } else {
            throw new IllegalArgumentException("Unhandled type of aggregation");
        }
    }

    private static AggregationDTO createAggregationDTO(String name, StringTermsAggregate aggregation, AggregationAnalyzer aggregationAnalyzer) {
        return new AggregationDTO(
            name,
            aggregationAnalyzer.getAggregationType(name),
            aggregation.buckets()
                       .array()
                       .stream()
                       .map(bucket -> new BucketDTO(bucket.key().stringValue(), bucket.docCount()))
                       .toList()
        );
    }
}
