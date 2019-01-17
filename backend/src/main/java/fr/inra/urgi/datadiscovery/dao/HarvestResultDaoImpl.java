package fr.inra.urgi.datadiscovery.dao;

import fr.inra.urgi.datadiscovery.harvest.HarvestResult;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.query.FetchSourceFilterBuilder;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;

import static org.elasticsearch.index.query.QueryBuilders.matchAllQuery;

/**
 * Implementation of {@link HarvestResultDaoCustom}
 * @author JB Nizet, R. Flores
 */
public class HarvestResultDaoImpl implements HarvestResultDaoCustom {

    private final ElasticsearchRestTemplate elasticsearchTemplate;

    public HarvestResultDaoImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        this.elasticsearchTemplate = elasticsearchTemplate;
    }

    @Override
    public Page<HarvestResult> list(Pageable page) {
        NativeSearchQuery searchQuery = new NativeSearchQueryBuilder()
            .withQuery(matchAllQuery())
            .withSourceFilter(new FetchSourceFilterBuilder().withIncludes("id", "startInstant", "endInstant", "duration").build())
            .withSort(SortBuilders.fieldSort("startInstant").order(SortOrder.DESC))
            .withPageable(page)
            .build();

        return this.elasticsearchTemplate.queryForPage(searchQuery, HarvestResult.class);
    }
}
