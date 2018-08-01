package fr.inra.urgi.rare.dao;

import static org.elasticsearch.index.query.QueryBuilders.*;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.domain.IndexedGeneticResource;
import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.MatchAllQueryBuilder;
import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.TermsAggregationBuilder;
import org.elasticsearch.search.suggest.SuggestBuilder;
import org.elasticsearch.search.suggest.SuggestBuilders;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;
import org.springframework.data.elasticsearch.core.query.FetchSourceFilterBuilder;
import org.springframework.data.elasticsearch.core.query.IndexQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.data.elasticsearch.core.query.SourceFilter;

/**
 * Implementation of {@link GeneticResourceDaoCustom}
 * @author JB Nizet
 */
public class GeneticResourceDaoImpl implements GeneticResourceDaoCustom {

    /**
     * The name of the completion suggestion
     */
    private static final String COMPLETION = "completion";

    /**
     * The name of the field on which the completion suggester is applied
     */
    private static final String SUGGESTIONS_FIELD = "suggestions";

    /**
     * Contains the fields searchable on a {@link GeneticResource}.
     * This is basically all fields at the exception of a few ones like `identifier`,
     * and the ones containing a URL or a numeric value.
     */
    private static final Set<String> SEARCHABLE_FIELDS = Collections.unmodifiableSet(Stream.of(
        "name",
        "description",
        "pillarName",
        "databaseSource",
        "domain",
        "taxon",
        "family",
        "genus",
        "species",
        "materialType",
        "biotopeType",
        "countryOfOrigin",
        "countryOfCollect"
    ).collect(Collectors.toSet()));

    private final ElasticsearchTemplate elasticsearchTemplate;

    public GeneticResourceDaoImpl(ElasticsearchTemplate elasticsearchTemplate) {
        this.elasticsearchTemplate = elasticsearchTemplate;
    }

    @Override
    public AggregatedPage<GeneticResource> search(String query,
                                                  boolean aggregate,
                                                  SearchRefinements refinements,
                                                  Pageable page) {

        // this full text query is executed, and its results are used to compute aggregations
        MultiMatchQueryBuilder fullTextQuery = multiMatchQuery(query, SEARCHABLE_FIELDS.toArray(new String[0]));

        // this post filter query is applied, after the aggregation have been computed, to apply the
        // refinements (i.e. the aggregation/facet criteria).
        // See https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-post-filter.html
        BoolQueryBuilder refinementQuery = boolQuery();
        for (RareAggregation term : refinements.getTerms()) {
            refinementQuery.must(termsQuery(term.getField(), refinements.getRefinementsForTerm(term)));
        }

        // this allows avoiding to get back the suggestions field in the found documents, since we don't care
        // about them, and they're large
        SourceFilter sourceFilter = new FetchSourceFilterBuilder().withExcludes(SUGGESTIONS_FIELD).build();

        NativeSearchQueryBuilder builder = new NativeSearchQueryBuilder()
            .withQuery(fullTextQuery)
            .withSourceFilter(sourceFilter)
            .withFilter(refinementQuery)
            .withPageable(page);

        if (aggregate) {
            Stream.of(RareAggregation.values()).forEach(rareAggregation ->
                builder.addAggregation(AggregationBuilders.terms(rareAggregation.getName())
                                                          .field(rareAggregation.getField())
                                                          .size(rareAggregation.getType().getMaxBuckets())));
        }

        return elasticsearchTemplate.queryForPage(builder.build(), GeneticResource.class);
    }

    @Override
    public List<String> suggest(String term) {
        SuggestBuilder suggestion =
            new SuggestBuilder().addSuggestion(COMPLETION,
                                               SuggestBuilders.completionSuggestion(SUGGESTIONS_FIELD)
                                                              .text(term)
                                                              .size(8)
                                                              .skipDuplicates(true));

        Client client = elasticsearchTemplate.getClient();
        String index = elasticsearchTemplate.getPersistentEntityFor(GeneticResource.class).getIndexName();

        SearchRequestBuilder searchRequestBuilder = client.prepareSearch(index);
        SearchResponse response =
            searchRequestBuilder.suggest(suggestion)
                                .setFetchSource(false) // avoid getting the source documents, which are useless
                                .get();

        return response.getSuggest()
                       .getSuggestion(COMPLETION)
                       .getEntries()
                       .stream()
                       .flatMap(entry -> entry.getOptions().stream())
                       .map(option -> option.getText().string())
                       .collect(Collectors.toList());
    }

    @Override
    public void saveAll(Collection<IndexedGeneticResource> indexedGeneticResources) {
        List<IndexQuery> queries = indexedGeneticResources.stream().map(this::createIndexQuery).collect(Collectors.toList());
        elasticsearchTemplate.bulkIndex(queries);
        elasticsearchTemplate.refresh(elasticsearchTemplate.getPersistentEntityFor(GeneticResource.class).getIndexName());
    }

    @Override
    public Terms findPillars() {
        String pillarAggregationName = "pillar";
        TermsAggregationBuilder pillar =
            AggregationBuilders.terms(pillarAggregationName).field("pillarName.keyword").size(100);
        TermsAggregationBuilder databaseSource =
            AggregationBuilders.terms(DATABASE_SOURCE_AGGREGATION_NAME).field("databaseSource.keyword").size(100);
        TermsAggregationBuilder portalURL =
            AggregationBuilders.terms(PORTAL_URL_AGGREGATION_NAME).field("portalURL.keyword").size(2);
        databaseSource.subAggregation(portalURL);
        pillar.subAggregation(databaseSource);

        NativeSearchQueryBuilder builder = new NativeSearchQueryBuilder()
            .withQuery(new MatchAllQueryBuilder())
            .addAggregation(pillar)
            .withPageable(NoPage.INSTANCE);

        AggregatedPage<GeneticResource> geneticResources = elasticsearchTemplate.queryForPage(builder.build(),
                                                                                              GeneticResource.class);
        return geneticResources.getAggregations().get(pillarAggregationName);
    }

    private IndexQuery createIndexQuery(IndexedGeneticResource entity) {
        IndexQuery query = new IndexQuery();
        query.setObject(entity);
        query.setId(entity.getGeneticResource().getId());
        return query;
    }

    /**
     * A Pageable implementation allowing to avoid loading any page (i.e. with a size equal to 0), because we
     * are not interested in loading search results, but only the aggregations
     * (see https://www.elastic.co/guide/en/elasticsearch/reference/6.3/returning-only-agg-results.html).
     *
     * We would normally use a {@link org.springframework.data.domain.PageRequest} as an implementation of
     * {@link Pageable}, but PageRequest considers 0 as an invalid size. Hence this implementation.
     */
    private static final class NoPage implements Pageable {

        public static final NoPage INSTANCE = new NoPage();

        private NoPage() {
        }

        @Override
        public int getPageNumber() {
            return 0;
        }

        @Override
        public int getPageSize() {
            return 0;
        }

        @Override
        public long getOffset() {
            return 0;
        }

        @Override
        public Sort getSort() {
            return null;
        }

        @Override
        public Pageable next() {
            throw new UnsupportedOperationException();
        }

        @Override
        public Pageable previousOrFirst() {
            throw new UnsupportedOperationException();
        }

        @Override
        public Pageable first() {
            throw new UnsupportedOperationException();
        }

        @Override
        public boolean hasPrevious() {
            return false;
        }
    }
}
