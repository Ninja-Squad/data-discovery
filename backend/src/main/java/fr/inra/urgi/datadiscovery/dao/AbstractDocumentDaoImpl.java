package fr.inra.urgi.datadiscovery.dao;

import static fr.inra.urgi.datadiscovery.dao.DocumentDao.DATABASE_SOURCE_AGGREGATION_NAME;
import static fr.inra.urgi.datadiscovery.dao.DocumentDao.PORTAL_URL_AGGREGATION_NAME;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.aggregations.Aggregation;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MultiMatchQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TermsQuery;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.CompletionSuggestOption;
import co.elastic.clients.elasticsearch.core.search.FieldSuggester;
import co.elastic.clients.elasticsearch.core.search.Suggester;
import co.elastic.clients.elasticsearch.core.search.Suggestion;
import fr.inra.urgi.datadiscovery.domain.AggregatedPage;
import fr.inra.urgi.datadiscovery.domain.SearchDocument;
import fr.inra.urgi.datadiscovery.domain.SuggestionDocument;
import fr.inra.urgi.datadiscovery.pillar.PillarDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregations;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.elasticsearch.client.elc.Queries;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.DeleteQuery;
import org.springframework.data.elasticsearch.core.query.HighlightQuery;
import org.springframework.data.elasticsearch.core.query.IndexQuery;
import org.springframework.data.elasticsearch.core.query.highlight.Highlight;
import org.springframework.data.elasticsearch.core.query.highlight.HighlightField;
import org.springframework.data.elasticsearch.core.query.highlight.HighlightFieldParameters;
import org.springframework.data.elasticsearch.core.query.highlight.HighlightParameters;

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

    protected final ElasticsearchTemplate elasticsearchTemplate;
    private final AbstractDocumentHighlighter<D> documentHighlighter;
    private final AggregationAnalyzer aggregationAnalyzer;

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    public AbstractDocumentDaoImpl(ElasticsearchTemplate elasticsearchTemplate,
                                   AbstractDocumentHighlighter<D> documentHighlighter,
                                   AggregationAnalyzer aggregationAnalyzer) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.documentHighlighter = documentHighlighter;
        this.aggregationAnalyzer = aggregationAnalyzer;
    }

    @Override
    public AggregatedPage<D> search(String query,
                                    boolean highlight,
                                    boolean descendants,
                                    SearchRefinements refinements,
                                    Pageable page) {
        NativeQueryBuilder builder = getQueryBuilder(query, refinements, page, descendants);
        if (highlight) {
            Highlight theHighlight = new Highlight(
                HighlightParameters.builder().withEncoder("html").build(),
                List.of(
                    new HighlightField("description", HighlightFieldParameters.builder().withNumberOfFragments(0).build()),
                    new HighlightField("description.synonyms", HighlightFieldParameters.builder().withNumberOfFragments(0).build())
                )
            );
            builder.withHighlightQuery(
                new HighlightQuery(theHighlight, getDocumentClass())
            );
        }

        NativeQuery searchQuery = builder.build();
        logger.debug("Search query: {}", searchQuery);
        return AggregatedPage.fromSearchHits(
            elasticsearchTemplate.search(searchQuery, getDocumentClass()),
            page,
            aggregationAnalyzer,
            documentHighlighter
        );
    }


    @Override
    public AggregatedPage<D> aggregate(String query,
                                       SearchRefinements refinements,
                                       AggregationSelection aggregationSelection,
                                       boolean descendants) {

        PageRequest page = PageRequest.of(0, 1);
        NativeQueryBuilder builder = getQueryBuilder(query, refinements, page, descendants);

        List<? extends AppAggregation> aggregations =
            aggregationSelection == AggregationSelection.MAIN
                ? getMainAppAggregations()
                : getAppAggregations();

        aggregations.forEach(appAggregation -> {
            Aggregation filterAggregation = createFilterAggregation(appAggregation, refinements, descendants);
            builder.withAggregation(appAggregation.getName(), filterAggregation);
        });

        AggregatedPage<D> result = AggregatedPage.fromSearchHits(
            elasticsearchTemplate.search(builder.build(), getDocumentClass()),
            page,
            aggregationAnalyzer,
            documentHighlighter
        );

        return result;
    }

    protected List<String> getAnnotationsIds(SearchRefinements refinements){
        List<String> annotIds = new ArrayList<String>();
        Pattern pattern = Pattern.compile("\\((.*)\\)\\s*$");
        for (AppAggregation term : refinements.getTerms()) {
            if (term.getName().equals("annot")) {
                Set<String> annotRefinements = refinements.getRefinementsForTerm(term);
                for (String annotRefinement : annotRefinements) {
                    Matcher matcher = pattern.matcher(annotRefinement);
                    if (matcher.find()) {
                        annotIds.add(matcher.group(0).replace("(","").replace(")","").replaceAll("\\s", ""));
                    }
                }
            }
        }
        return annotIds;
    }

    protected NativeQueryBuilder getQueryBuilder(String query, SearchRefinements refinements, Pageable page, boolean descendants) {
        NativeQueryBuilder nativeQueryBuilder = NativeQuery.builder();
        // if the query is empty, rather than showing no result, we show everything.
        // this is necessary in Faidare because we need to show aggregations on the home page, and be able to search
        // only with refinements

        // this full text query is executed, and its results are used to compute aggregations
        Query partialFullTextQuery = query.trim().isEmpty()
            ? Query.of(b -> b.matchAll(Queries.matchAllQuery()))
            : Query.of(b -> b.multiMatch(MultiMatchQuery.of(builder -> builder.query(query).fields(List.copyOf(getSearchableFields())))));

        Query contextualQuery = this.getContextualQuery();
        Query fullTextQuery = contextualQuery != null
            ? Query.of(b -> b.bool(builder -> builder.must(partialFullTextQuery).must(contextualQuery)))
            : partialFullTextQuery;

        // this post filter query is applied, after the aggregation have been computed, to apply the
        // refinements (i.e. the aggregation/facet criteria).
        // See https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-post-filter.html
        Query refinementQuery = Query.of(b -> b.bool(BoolQuery.of(builder -> {
            for (AppAggregation term : refinements.getTerms()) {
                builder.must(createRefinementQuery(refinements, term, descendants));
            }
            SearchRefinements implicitRefinements = getImplicitSearchRefinements();
            for (AppAggregation term : implicitRefinements.getTerms()) {
                builder.must(createRefinementQuery(implicitRefinements, term, descendants));
            }
            return builder;
        })));

        return NativeQuery.builder()
            .withQuery(fullTextQuery)
            .withFilter(refinementQuery)
            .withPageable(page);

    }


    private Aggregation createFilterAggregation(AppAggregation appAggregation,
                                                SearchRefinements searchRefinements,
                                                boolean descendants) {
        return Aggregation.of(
            b ->
                b.filter(createQueryForAllRefinementsExcept(searchRefinements, appAggregation, descendants))
                 .aggregations(
                     appAggregation.getName(),
                     ab -> ab.terms(
                         tb -> tb.field(appAggregation.getField())
                                 .missing(SearchDocument.NULL_VALUE)
                                 .size(appAggregation.getType().getMaxBuckets())
                     )
                 )
        );
    }

    private Query createQueryForAllRefinementsExcept(SearchRefinements refinements,
                                                     AppAggregation appAggregation,
                                                     boolean descendants) {
        return Query.of(b -> b.bool(
           builder -> {
               for (AppAggregation term : refinements.getTerms()) {
                   if (!term.equals(appAggregation)) {
                       builder.must(createRefinementQuery(refinements, term, descendants));
                   }
               }
               SearchRefinements implicitRefinements = getImplicitSearchRefinements();
               for (AppAggregation term : implicitRefinements.getTerms()) {
                   builder.must(createRefinementQuery(implicitRefinements, term, descendants));
               }
               return builder;
           }
        ));
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
    private Query createRefinementQuery(SearchRefinements refinements, AppAggregation term, boolean descendants) {
        Set<String> acceptedValues = refinements.getRefinementsForTerm(term);
        TermsQuery termsQuery =
            TermsQuery.of(builder ->
                              builder.field(term.getField())
                                     .terms(fb -> fb.value(acceptedValues.stream().map(FieldValue::of).toList()))
            );
        Query boolQuery = Query.of(qb -> qb.bool(BoolQuery.of(builder -> {
            if (term.getName().equals("annot")) {
                List<String> goIds = getAnnotationsIds(refinements);
                builder.should(b -> b.terms(tb ->
                                                tb.field("annotationId.keyword")
                                                  .terms(fb -> fb.value(goIds.stream().map(FieldValue::of).toList())))
                );
                if (descendants) {
                    for (String goId : goIds) {
                        builder.should(goBuilder -> goBuilder.prefix(prefixBuilder -> prefixBuilder.field("ancestors.keyword").value(goId)));
                    }
                }
            }
            else {
                builder.should(b -> b.terms(termsQuery));
            }
            return builder;
        })));

        if (acceptedValues.contains(SearchDocument.NULL_VALUE)) {
            return Query.of(
                b -> b.bool(
                    builder -> builder.should(boolQuery)
                                      .should(
                                          nullBuilder -> nullBuilder.bool(
                                              bb -> bb.mustNot(
                                                  mnb -> mnb.exists(
                                                      eb -> eb.field(term.getField())
                                                  )
                                              )
                                          )
                                      )
                )
            );
        }
        else {
            return boolQuery;
        }
    }

    @Override
    public List<String> suggest(String term) {
        return elasticsearchTemplate.execute(client -> {
            Suggester suggester = Suggester.of(builder -> {
                builder.suggesters(
                    COMPLETION,
                    FieldSuggester.of(
                        fsBuilder -> fsBuilder.completion(
                            completionBuilder ->
                                completionBuilder.field(SUGGESTIONS_FIELD)
                                                 .size(MAX_RETURNED_SUGGESTION_COUNT * 2) // because we deduplicate case-differing
                                                 .skipDuplicates(true) // suggestions after
                        ).text(term)
                    )
                );
                return builder;
            });

            String index = elasticsearchTemplate.getIndexCoordinatesFor(getSuggestionDocumentClass()).getIndexName();

            try {
                SearchResponse<Void> response = client.search(
                    SearchRequest.of(
                        b -> b.suggest(suggester).source(sourceBuilder -> sourceBuilder.fetch(false)).index(index)
                    ),
                    Void.class
                );

                Map<String, List<Suggestion<Void>>> suggest = response.suggest();
                if (suggest.isEmpty()) {
                    // no data in the database
                    return Collections.emptyList();
                }

                List<String> suggestions = suggest.get(COMPLETION)
                                                  .stream()
                                                  .flatMap(suggestion -> suggestion.completion().options().stream())
                                                  .map(CompletionSuggestOption::text)
                                                  .toList();

                return removeSuggestionsDifferingByCase(suggestions);
            }
            catch (IOException e) {
                logger.warn("Could not fetch suggestions for term: '{}'", term, e);
                return Collections.emptyList();
            }
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
        elasticsearchTemplate.delete(DeleteQuery.builder(
            NativeQuery.builder().withQuery(Queries.matchAllQueryAsQuery()).build()
        ).build(), getSuggestionDocumentClass());
        elasticsearchTemplate.indexOps(getSuggestionDocumentClass()).refresh();
    }

    @Override
    public List<PillarDTO> findPillars() {
        PillarAggregationDescriptor descriptor = getPillarAggregationDescriptor();

        Aggregation databaseSource = Aggregation.of(
            b -> {
                var terms = b.terms(
                    builder ->
                        builder.field(descriptor.getDatabaseSourceProperty()).size(100)
                );
                if (descriptor.getPortalUrlProperty() != null) {
                    terms.aggregations(
                        PORTAL_URL_AGGREGATION_NAME,
                        Aggregation.of(
                            b2 ->
                                b2.terms(
                                    builder ->
                                        builder.field(descriptor.getPortalUrlProperty()).size(2)
                                )
                        )
                    );
                }
                return terms;
            }
        );

        Aggregation pillar = Aggregation.of(
            b -> b.terms(
                builder -> builder.field(descriptor.getPillarNameProperty()).size(100)
            ).aggregations(
                DATABASE_SOURCE_AGGREGATION_NAME,
                databaseSource
            )
        );

        Query refinementQuery = Query.of(
            b -> b.bool(
                builder -> {
                    SearchRefinements implicitRefinements = getImplicitSearchRefinements();
                    for (AppAggregation term : implicitRefinements.getTerms()) {
                        builder.must(createRefinementQuery(implicitRefinements, term, false));
                    }
                    return builder;
                })
        );
        String pillarAggregationName = "pillar";
        NativeQueryBuilder builder = NativeQuery.builder()
            .withQuery(refinementQuery)
            .withAggregation(pillarAggregationName, pillar)
            .withPageable(NoPage.INSTANCE);

        SearchHits<D> searchHits = elasticsearchTemplate.search(builder.build(), getDocumentClass());
        ElasticsearchAggregations elasticsearchAggregations =
            (ElasticsearchAggregations) searchHits.getAggregations();
        return PillarDTO.fromAggregate(
            elasticsearchAggregations.aggregationsAsMap().get(pillarAggregationName).aggregation().getAggregate().sterms()
        );
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
    }

    /**
     * Gets a contextual query, or null, which is added to the main search query.
     * A contextual query is, for example, a query that depends on the current user.
     * This implementation returns null by default, but can be overridden by subclasses
     */
    protected Query getContextualQuery() {
        return null;
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
