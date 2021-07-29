package fr.inra.urgi.datadiscovery.dao;

import static fr.inra.urgi.datadiscovery.dao.DocumentDao.DATABASE_SOURCE_AGGREGATION_NAME;
import static fr.inra.urgi.datadiscovery.dao.DocumentDao.PORTAL_URL_AGGREGATION_NAME;
import static org.elasticsearch.index.query.QueryBuilders.*;

import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import fr.inra.urgi.datadiscovery.domain.AggregatedPage;
import fr.inra.urgi.datadiscovery.domain.AggregatedPageImpl;
import fr.inra.urgi.datadiscovery.domain.SearchDocument;
import fr.inra.urgi.datadiscovery.domain.SuggestionDocument;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.index.query.*;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.Aggregations;
import org.elasticsearch.search.aggregations.bucket.filter.Filter;
import org.elasticsearch.search.aggregations.bucket.filter.FilterAggregationBuilder;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.TermsAggregationBuilder;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.fetch.subphase.highlight.HighlightBuilder;
import org.elasticsearch.search.suggest.Suggest;
import org.elasticsearch.search.suggest.SuggestBuilder;
import org.elasticsearch.search.suggest.SuggestBuilders;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.*;

/**
 * Base class for implementations of {@link DocumentDao}
 * @author JB Nizet, R. Flores
 */
public abstract class AbstractDocumentDaoImpl<D extends SearchDocument> implements DocumentDaoCustom<D> {

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
    private static final int MAX_RETURNED_SUGGESTION_COUNT = 10;

    protected final ElasticsearchRestTemplate elasticsearchTemplate;
    private final AbstractDocumentHighlighter<D> documentHighlighter;

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    public AbstractDocumentDaoImpl(ElasticsearchRestTemplate elasticsearchTemplate,
                                   AbstractDocumentHighlighter<D> documentHighlighter) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.documentHighlighter = documentHighlighter;
    }

    @Override
    public AggregatedPage<D> search(String query,
                                    boolean highlight,
                                    boolean descendants,
                                    SearchRefinements refinements,
                                    Pageable page) {
        NativeSearchQueryBuilder builder = getQueryBuilder(query, refinements, page, descendants);

        if (highlight) {
            builder.withHighlightFields(
                        new HighlightBuilder.Field("description").numOfFragments(0),
                        new HighlightBuilder.Field("description.synonyms").numOfFragments(0)
                    ).withHighlightBuilder(new HighlightBuilder().encoder("html"));
        }

        NativeSearchQuery searchQuery = builder.build();
        logger.debug("Search query: {}", searchQuery);
        return AggregatedPage.fromSearchHits(
            elasticsearchTemplate.search(searchQuery, getDocumentClass()),
            page,
            documentHighlighter
        );
    }


    @Override
    public AggregatedPage<D> aggregate(String query,
                                       SearchRefinements refinements,
                                       AggregationSelection aggregationSelection,
                                       boolean descendants) {

        PageRequest page = PageRequest.of(0, 1);
        NativeSearchQueryBuilder builder = getQueryBuilder(query, refinements, page, descendants);

        List<? extends AppAggregation> aggregations =
                aggregationSelection == AggregationSelection.MAIN ? getMainAppAggregations() : getAppAggregations();

        aggregations.forEach(appAggregation -> {
            FilterAggregationBuilder filterAggregation = createFilterAggregation(appAggregation, refinements, descendants);
            builder.addAggregation(filterAggregation);
        });

        AggregatedPage<D> result = AggregatedPage.fromSearchHits(
            elasticsearchTemplate.search(builder.build(), getDocumentClass()),
            page,
            documentHighlighter
        );

        // the page contains filter aggregations, each containing a sub terms aggregation.
        // we actually want the terms aggregation directly in the page
        result = extractTermsAggregations(result);
        return result;
    }

    protected List<String> getAnnotationsIds(SearchRefinements refinements){
        List<String> annotIds = new ArrayList<String>();
        Pattern pattern = Pattern.compile("\\(\\w{2,6}:\\d{7}\\)$");
        for (AppAggregation term : refinements.getTerms()) {
            if (term.getName().equals("annot")) {
                Set<String> annotRefinements = refinements.getRefinementsForTerm(term);
                for (String annotRefinement : annotRefinements) {
                    Matcher matcher = pattern.matcher(annotRefinement);
                    if (matcher.find()) {
                        annotIds.add(matcher.group(0).replace("(","").replace(")",""));
                    }
                }
            }
        }
        return annotIds;
    }

    private NativeSearchQueryBuilder getQueryBuilder(String query, SearchRefinements refinements, Pageable page, boolean descendants) {
        // if the query is empty, rather than showing no result, we show everything.
        // this is necessary in Faidare because we need to show aggregations on the home page, and be able to search
        // only with refinements

        // this full text query is executed, and its results are used to compute aggregations
        AbstractQueryBuilder<?> fullTextQuery = query.trim().isEmpty()
                ? matchAllQuery()
                : multiMatchQuery(query, getSearchableFields().toArray(new String[0]));

        // this post filter query is applied, after the aggregation have been computed, to apply the
        // refinements (i.e. the aggregation/facet criteria).
        // See https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-post-filter.html
        BoolQueryBuilder refinementQuery = boolQuery();
        for (AppAggregation term : refinements.getTerms()) {
            refinementQuery.must(createRefinementQuery(refinements, term, descendants));
        }

        SearchRefinements implicitRefinements = getImplicitSearchRefinements();
        for (AppAggregation term : implicitRefinements.getTerms()) {
            refinementQuery.must(createRefinementQuery(implicitRefinements, term, descendants));
        }

        return new NativeSearchQueryBuilder()
            .withQuery(fullTextQuery)
            .withFilter(refinementQuery)
            .withPageable(page);
    }


    private FilterAggregationBuilder createFilterAggregation(AppAggregation appAggregation,
                                                             SearchRefinements searchRefinements, boolean descendants) {
        return AggregationBuilders.filter(
            appAggregation.getName(),
            createQueryForAllRefinementsExcept(searchRefinements, appAggregation, descendants)
        ).subAggregation(
            AggregationBuilders.terms(appAggregation.getName())
                               .field(appAggregation.getField())
                               .missing(SearchDocument.NULL_VALUE)
                               .size(appAggregation.getType().getMaxBuckets()));
    }

    private QueryBuilder createQueryForAllRefinementsExcept(SearchRefinements refinements,
                                                            AppAggregation appAggregation, boolean descendants) {
        BoolQueryBuilder refinementQuery = boolQuery();
        for (AppAggregation term : refinements.getTerms()) {
            if (!term.equals(appAggregation)) {
                refinementQuery.must(createRefinementQuery(refinements, term, descendants));
            }
        }
        SearchRefinements implicitRefinements = getImplicitSearchRefinements();
        for (AppAggregation term : implicitRefinements.getTerms()) {
            refinementQuery.must(createRefinementQuery(implicitRefinements, term, descendants));
        }
        return refinementQuery;
    }

    private AggregatedPage<D> extractTermsAggregations(AggregatedPage<D> page) {
        List<Terms> termsAggregations =
            page.getAggregations()
                .asList()
                .stream()
                .map(aggregation -> (Terms) ((Filter) aggregation).getAggregations().get(aggregation.getName()))
                .collect(Collectors.toList());

        return new AggregatedPageImpl<>(page, new Aggregations(termsAggregations));
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
     *         mapping, as {@link SearchDocument#NULL_VALUE}. This NULL value can be considered as any other real value
     *         and all we need is thus a terms query containing all the accepted values, including NULL
     *     </li>
     *     <li>
     *         The field is an array, and can be an empty array. In that case, it's considered by ElasticSearch as
     *         missing, but the aggregation created in {@link DocumentDaoCustom#search(String, boolean, boolean, SearchRefinements, Pageable)}
     *         puts missing values in the bucket with the key {@link SearchDocument#NULL_VALUE}. So, the aggregation
     *         considers null values and missing values as the same value: {@link SearchDocument#NULL_VALUE}.
     *         It's still considered, when searching, as a missing value though. So, if {@link SearchDocument#NULL_VALUE}
     *         is present in the set of accepted values, we want both the null values and the missing values. We thus
     *         create an <code>or</code> query (i.e. a <code>should</code> bool query in Elasticsearch terms), which
     *         combines a terms query containing all the accepted values, including NULL, and a "not exists" query.
     *         This combined query thus returns all the documents that have one of the real accepted values, or is null
     *         and thus has the value {@link SearchDocument#NULL_VALUE} in the index, or does not exist.
     *     </li>
     * </ul>
     */
    private QueryBuilder createRefinementQuery(SearchRefinements refinements, AppAggregation term, boolean descendants) {
        Set<String> acceptedValues = refinements.getRefinementsForTerm(term);
        TermsQueryBuilder termsQuery = termsQuery(term.getField(), acceptedValues);
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
        if (term.getName().equals("annot")) {
            List<String> goIds = getAnnotationsIds(refinements);
            boolQuery.should(termsQuery("annotationId.keyword", goIds));
            if(descendants) {
                for(int i =0 ; i < goIds.size(); i++) {
                    boolQuery.should(prefixQuery("ancestors.keyword", goIds.get(i))) ;
                }
            }
        }else{
            boolQuery.should(termsQuery);
        }

        if (acceptedValues.contains(SearchDocument.NULL_VALUE)) {
            return boolQuery()
                .should(boolQuery)
                .should(boolQuery().mustNot(existsQuery(term.getField())));
        }
        else {
            return boolQuery;
        }
    }

    @Override
    public List<String> suggest(String term) {
        return elasticsearchTemplate.execute(client -> {
            SuggestBuilder suggestion =
                new SuggestBuilder().addSuggestion(
                    COMPLETION,
                    SuggestBuilders.completionSuggestion(SUGGESTIONS_FIELD)
                                   .text(term)
                                   .size(MAX_RETURNED_SUGGESTION_COUNT * 2) // because we deduplicate case-differing
                                   // suggestions after
                                   .skipDuplicates(true));

            String index = elasticsearchTemplate.getIndexCoordinatesFor(getSuggestionDocumentClass()).getIndexName();
            SearchSourceBuilder sourceBuilder = new SearchSourceBuilder().suggest(suggestion);
            sourceBuilder.fetchSource(false);
            SearchRequest req = new SearchRequest(new String[]{index}, sourceBuilder);
            SearchResponse response = null;
            try {
                response = client.search(req, RequestOptions.DEFAULT);
            } catch (IOException e) {
                logger.warn("Could not fetch suggestions for term: '{}'", term, e);
                return Collections.emptyList();
            }

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
        });
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
    public void saveAllSuggestions(Collection<SuggestionDocument> suggestions) {
        List<IndexQuery> queries = suggestions.parallelStream().map(this::createSuggestionIndexQuery).collect(Collectors.toList());
        elasticsearchTemplate.bulkIndex(queries, getSuggestionDocumentClass());
        // allow to refresh systematically since this method is only used for testing purpose, impact of performances is low
        elasticsearchTemplate.indexOps(getSuggestionDocumentClass()).refresh();
    }

    @Override
    public void deleteAllSuggestions() {
        elasticsearchTemplate.delete(new NativeSearchQueryBuilder().withQuery(matchAllQuery()).build(), getSuggestionDocumentClass());
        elasticsearchTemplate.indexOps(getSuggestionDocumentClass()).refresh();
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

        BoolQueryBuilder refinementQuery = boolQuery();
        SearchRefinements implicitRefinements = getImplicitSearchRefinements();
        for (AppAggregation term : implicitRefinements.getTerms()) {
            refinementQuery.must(createRefinementQuery(implicitRefinements, term, false));
        }
        NativeSearchQueryBuilder builder = new NativeSearchQueryBuilder()
            .withQuery(refinementQuery)
            .addAggregation(pillar)
            .withPageable(NoPage.INSTANCE);

        SearchHits<D> searchHits = elasticsearchTemplate.search(builder.build(), getDocumentClass());
        return searchHits.getAggregations().get(pillarAggregationName);
    }

    @Override
    public void refresh() {
        elasticsearchTemplate.indexOps(getDocumentClass()).refresh();
    }

    private IndexQuery createSuggestionIndexQuery(SuggestionDocument suggestion) {
        IndexQuery query = new IndexQuery();
        query.setObject(suggestion);
        return query;
    }

    /**
     * Returns the specific {@link SearchDocument} class of this DAO
     */
    protected abstract Class<D> getDocumentClass();

    /**
     * Returns the {@link SuggestionDocument} class of this DAO.
     * No need to make it abstract since it does not differ across applications
     */
    protected Class<SuggestionDocument> getSuggestionDocumentClass(){ return SuggestionDocument.class; }

    /**
     * Returns the list of fields of the specific {@link SearchDocument} subclass on which the full text query must be
     * applied.
     */
    protected abstract Set<String> getSearchableFields();

    /**
     * Returns the ordered list of {@link AppAggregation} to apply
     */
    protected abstract List<? extends AppAggregation> getAppAggregations();

    /**
     * Returns the ordered list of main {@link AppAggregation} to apply. The main app agregations are the ones
     * displayed on the home page if an application chooses to do so rather than displaying the pillars
     */
    protected abstract List<? extends AppAggregation> getMainAppAggregations();

    /**
     * Gets the descriptor allowing to create the pillars aggregation
     */
    protected abstract PillarAggregationDescriptor getPillarAggregationDescriptor();

    protected SearchRefinements getImplicitSearchRefinements() {
        return SearchRefinements.EMPTY;
    };

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
            return Sort.unsorted();
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

        @Override
        public Pageable withPage(int pageNumber) {
            throw new UnsupportedOperationException();
        }
    }
}
