package fr.inra.urgi.datadiscovery.dao;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

import fr.inra.urgi.datadiscovery.domain.Document;
import fr.inra.urgi.datadiscovery.domain.IndexedDocument;
import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.MatchAllQueryBuilder;
import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.TermsQueryBuilder;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.Aggregations;
import org.elasticsearch.search.aggregations.bucket.filter.Filter;
import org.elasticsearch.search.aggregations.bucket.filter.FilterAggregationBuilder;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.TermsAggregationBuilder;
import org.elasticsearch.search.fetch.subphase.highlight.HighlightBuilder;
import org.elasticsearch.search.suggest.Suggest;
import org.elasticsearch.search.suggest.SuggestBuilder;
import org.elasticsearch.search.suggest.SuggestBuilders;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;
import org.springframework.data.elasticsearch.core.aggregation.impl.AggregatedPageImpl;
import org.springframework.data.elasticsearch.core.query.FetchSourceFilterBuilder;
import org.springframework.data.elasticsearch.core.query.IndexQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.data.elasticsearch.core.query.SourceFilter;

import static fr.inra.urgi.datadiscovery.dao.DocumentDao.DATABASE_SOURCE_AGGREGATION_NAME;
import static fr.inra.urgi.datadiscovery.dao.DocumentDao.PORTAL_URL_AGGREGATION_NAME;
import static org.elasticsearch.index.query.QueryBuilders.boolQuery;
import static org.elasticsearch.index.query.QueryBuilders.existsQuery;
import static org.elasticsearch.index.query.QueryBuilders.multiMatchQuery;
import static org.elasticsearch.index.query.QueryBuilders.termsQuery;

/**
 * Base class for implementations of {@link DocumentDao}
 * @author JB Nizet
 */
public abstract class AbstractDocumentDaoImpl<R extends Document, I extends IndexedDocument<R>>
    implements DocumentDaoCustom<R, I> {

    /**
     * The name of the completion suggestion
     */
    private static final String COMPLETION = "completion";

    /**
     * The name of the field on which the completion suggester is applied
     */
    private static final String SUGGESTIONS_FIELD = "suggestions";

    /**
     * The max number of suggestions returned to the caller
     */
    private int MAX_RETURNED_SUGGESTION_COUNT = 10;

    protected final ElasticsearchTemplate elasticsearchTemplate;
    private final AbstractDocumentHighlightMapper<R> documentHighlightMapper;

    public AbstractDocumentDaoImpl(ElasticsearchTemplate elasticsearchTemplate,
                                   AbstractDocumentHighlightMapper<R> documentHighlightMapper) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.documentHighlightMapper = documentHighlightMapper;
    }

    @Override
    public AggregatedPage<R> search(String query,
                                    boolean aggregate,
                                    boolean highlight,
                                    SearchRefinements refinements,
                                    Pageable page) {

        // this full text query is executed, and its results are used to compute aggregations
        MultiMatchQueryBuilder fullTextQuery = multiMatchQuery(query, getSearchableFields().toArray(new String[0]));

        // this post filter query is applied, after the aggregation have been computed, to apply the
        // refinements (i.e. the aggregation/facet criteria).
        // See https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-post-filter.html
        BoolQueryBuilder refinementQuery = boolQuery();
        for (AppAggregation term : refinements.getTerms()) {
            refinementQuery.must(createRefinementQuery(refinements, term));
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
            getAppAggregations().forEach(appAggregation -> {
                FilterAggregationBuilder filterAggregation = createFilterAggregation(appAggregation, refinements);
                builder.addAggregation(filterAggregation);
            });
        }

        if (highlight) {
            builder.withHighlightFields(new HighlightBuilder.Field("description").numOfFragments(0));
        }

        AggregatedPage<R> result = elasticsearchTemplate.queryForPage(builder.build(),
                                                                      getDocumentClass(),
                documentHighlightMapper);

        if (aggregate) {
            // the page contains filter aggregations, each containing a sub terms aggregation.
            // we actually want the terms aggregation directly in the page
            result = extractTermsAggregations(result);
        }
        return result;
    }

    private FilterAggregationBuilder createFilterAggregation(AppAggregation appAggregation,
                                                             SearchRefinements searchRefinements) {
        return AggregationBuilders.filter(
            appAggregation.getName(),
            createQueryForAllRefinementsExcept(searchRefinements, appAggregation)
        ).subAggregation(
            AggregationBuilders.terms(appAggregation.getName())
                               .field(appAggregation.getField())
                               .missing(Document.NULL_VALUE)
                               .size(appAggregation.getType().getMaxBuckets()));
    }

    private QueryBuilder createQueryForAllRefinementsExcept(SearchRefinements refinements,
                                                            AppAggregation appAggregation) {
        BoolQueryBuilder refinementQuery = boolQuery();
        for (AppAggregation term : refinements.getTerms()) {
            if (!term.equals(appAggregation)) {
                refinementQuery.must(createRefinementQuery(refinements, term));
            }
        }
        return refinementQuery;
    }

    private AggregatedPage<R> extractTermsAggregations(AggregatedPage<R> page) {
        List<Terms> termsAggregations =
            page.getAggregations()
                .asList()
                .stream()
                .map(aggregation -> (Terms) ((Filter) aggregation).getAggregations().get(aggregation.getName()))
                .collect(Collectors.toList());

        return new AggregatedPageImpl<>(page.getContent(),
                                        page.getPageable(),
                                        page.getTotalElements(),
                                        new Aggregations(termsAggregations),
                                        page.getScrollId(),
                                        page.getMaxScore());
    }

    /**
     * Creates a refinement query for the given term of the given refinements.
     * Here are the various cases:
     * <ul>
     *     <li>
     *         The field can't possibly be null (like the name, for example). In that case, all the acceptable values
     *         for the term are actual names, and all we need is a terms query containing all the accepted values
     *     </li>
     *     <li>
     *         The field is of type string and can be null. In that case, the null value is indexed, thanks to the
     *         mapping, as {@link Document#NULL_VALUE}. This NULL value can be considered as any other real value
     *         and all we need is thus a terms query containing all the accepted values, including NULL
     *     </li>
     *     <li>
     *         The field is an array, and can be an empty array. In that case, it's considered by ElasticSearch as
     *         missing, but the aggregation created in {@link #search(String, boolean, boolean, SearchRefinements, Pageable)}
     *         puts missing values in the bucket with the key {@link Document#NULL_VALUE}. So, the aggregation
     *         considers null values and missing values as the same value: {@link Document#NULL_VALUE}.
     *         It's still considered, when searching, as a missing value though. So, if {@link Document#NULL_VALUE}
     *         is present in the set of accepted values, we want both the null values and the missing values. We thus
     *         create an <code>or</code> query (i.e. a <code>should</code> bool query in Elasticsearch terms), which
     *         combines a terms query containing all the accepted values, including NULL, and a "not exists" query.
     *         This combined query thus returns all the documents that have one of the real accepted values, or is null
     *         and thus has the value {@link Document#NULL_VALUE} in the index, or does not exist.
     *     </li>
     * </ul>
     */
    private QueryBuilder createRefinementQuery(SearchRefinements refinements, AppAggregation term) {
        Set<String> acceptedValues = refinements.getRefinementsForTerm(term);
        TermsQueryBuilder termsQuery = termsQuery(term.getField(), acceptedValues);
        if (acceptedValues.contains(Document.NULL_VALUE)) {
            return boolQuery()
                .should(termsQuery)
                .should(boolQuery().mustNot(existsQuery(term.getField())));
        }
        else {
            return termsQuery;
        }
    }

    @Override
    public List<String> suggest(String term) {
        SuggestBuilder suggestion =
            new SuggestBuilder().addSuggestion(
                COMPLETION,
                SuggestBuilders.completionSuggestion(SUGGESTIONS_FIELD)
                               .text(term)
                               .size(MAX_RETURNED_SUGGESTION_COUNT * 2) // because we deduplicate case-differing
                               // suggestions after
                               .skipDuplicates(true));

        Client client = elasticsearchTemplate.getClient();
        String index = elasticsearchTemplate.getPersistentEntityFor(getDocumentClass()).getIndexName();

        SearchRequestBuilder searchRequestBuilder = client.prepareSearch(index);
        SearchResponse response =
            searchRequestBuilder.suggest(suggestion)
                                .setFetchSource(false) // avoid getting the source documents, which are useless
                                .get();

        Suggest suggest = response.getSuggest();
        if (suggest == null) {
            // no data in the database
            return Collections.emptyList();
        }

        List<String> suggestions = suggest.getSuggestion(COMPLETION)
                                          .getEntries()
                                          .stream()
                                          .flatMap(entry -> entry.getOptions().stream())
                                          .map(option -> option.getText().string())
                                          .collect(Collectors.toList());

        return removeSuggestionsDifferingByCase(suggestions);
    }

    private List<String> removeSuggestionsDifferingByCase(List<String> suggestions) {
        // Use a TreeSet with case insensitive order to only keep unique values, ignoring case
        TreeSet<String> distinctSuggestions = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        distinctSuggestions.addAll(suggestions);

        // Copy the remaining values to a HashSet, comparing by equality
        Set<String> remainingSuggestions = new HashSet<>(distinctSuggestions);

        // keep max 10 suggestions, in the original order, but only keep those which are equal one of the remaining
        // suggestions
        return suggestions.stream()
                          .filter(remainingSuggestions::contains).limit(MAX_RETURNED_SUGGESTION_COUNT)
                          .collect(Collectors.toList());
    }

    @Override
    public void saveAll(Collection<I> indexedDocuments) {
        List<IndexQuery> queries = indexedDocuments.stream().map(this::createIndexQuery).collect(Collectors.toList());
        elasticsearchTemplate.bulkIndex(queries);
        elasticsearchTemplate.refresh(elasticsearchTemplate.getPersistentEntityFor(getDocumentClass()).getIndexName());
    }

    @Override
    public void putMapping() {
        elasticsearchTemplate.putMapping(getIndexedDocumentClass());
    }

    @Override
    public Terms findPillars() {
        PillarAggregationDescriptor descriptor = getPillarAggregationDescriptor();
        String pillarAggregationName = "pillar";
        TermsAggregationBuilder pillar =
            AggregationBuilders.terms(pillarAggregationName).field(descriptor.getPillarNameProperty()).size(100);
        TermsAggregationBuilder databaseSource =
            AggregationBuilders.terms(DATABASE_SOURCE_AGGREGATION_NAME).field(descriptor.getDatabaseSourceProperty()).size(100);

        if (descriptor.getPortalUrlProperty() != null) {
            TermsAggregationBuilder portalURL =
                AggregationBuilders.terms(PORTAL_URL_AGGREGATION_NAME).field(descriptor.getPortalUrlProperty()).size(2);
            databaseSource.subAggregation(portalURL);
        }
        pillar.subAggregation(databaseSource);

        NativeSearchQueryBuilder builder = new NativeSearchQueryBuilder()
            .withQuery(new MatchAllQueryBuilder())
            .addAggregation(pillar)
            .withPageable(NoPage.INSTANCE);

        AggregatedPage<R> documents = elasticsearchTemplate.queryForPage(builder.build(), getDocumentClass());
        return documents.getAggregations().get(pillarAggregationName);
    }

    private IndexQuery createIndexQuery(I entity) {
        IndexQuery query = new IndexQuery();
        query.setObject(entity);
        query.setId(entity.getDocument().getId());
        return query;
    }

    /**
     * Returns the specific {@link Document} class of this DAO
     */
    protected abstract Class<R> getDocumentClass();

    /**
     * Returns the specific {@link IndexedDocument} class of this DAO
     */
    protected abstract Class<I> getIndexedDocumentClass();

    /**
     * Returns the list of fields of the specific {@link Document} subclass on which the full text query must be
     * applied.
     */
    protected abstract Set<String> getSearchableFields();

    /**
     * Returns the ordered list of {@link AppAggregation} to apply
     */
    protected abstract List<AppAggregation> getAppAggregations();

    /**
     * Gets the descriptor allowing to create the pillars aggregation
     */
    protected abstract PillarAggregationDescriptor getPillarAggregationDescriptor();

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
