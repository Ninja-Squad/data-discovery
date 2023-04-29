package fr.inra.urgi.datadiscovery.dao.faidare;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.datadiscovery.dao.AbstractDocumentDaoImpl;
import fr.inra.urgi.datadiscovery.dao.PillarAggregationDescriptor;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.domain.faidare.FaidareDocument;
import fr.inra.urgi.datadiscovery.filter.faidare.FaidareCurrentUser;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;

/**
 * Implementation of {@link FaidareDocumentDaoCustom}
 * @author JB Nizet
 */
public class FaidareDocumentDaoImpl extends AbstractDocumentDaoImpl<FaidareDocument> implements FaidareDocumentDaoCustom {

    /**
     * Contains the fields searchable on a {@link FaidareDocument}.
     * This is basically all fields at the exception of the ones containing a URL.
     */
    private static final Set<String> SEARCHABLE_FIELDS = Collections.unmodifiableSet(Stream.of(
        "name",
        "description",
        "description.synonyms",
        "entryType",
        "databaseName",
        "node",
        "species",
        "holdingInstitute",
        "biologicalStatus",
        "geneticNature",
        "countryOfOrigin",
        "taxonGroup",
        "observationVariableIds",
        "annotationName",
        "germplasmList",
        "accessionNumber",
        "germplasmNames",
        "traitNames"
    ).collect(Collectors.toSet()));

    private static final PillarAggregationDescriptor PILLAR_AGGREGATION_DESCRIPTOR =
        new PillarAggregationDescriptor("node.keyword",
                                        "databaseName.keyword",
                                        null);
    private final FaidareCurrentUser currentUser;

    public FaidareDocumentDaoImpl(ElasticsearchRestTemplate elasticsearchTemplate, FaidareCurrentUser currentUser) {
        super(elasticsearchTemplate, new FaidareDocumentHighlighter());
        this.currentUser = currentUser;
    }

    @Override
    protected QueryBuilder getContextualQuery() {
        return QueryBuilders.termsQuery("groupId", currentUser.get().getAccessibleGroupIds());
    }

    @Override
    protected Class<FaidareDocument> getDocumentClass() {
        return FaidareDocument.class;
    }

    @Override
    protected Set<String> getSearchableFields() {
        return SEARCHABLE_FIELDS;
    }

    @Override
    protected List<FaidareAggregation> getAppAggregations() {
        return Arrays.asList(FaidareAggregation.values());
    }

    @Override
    protected List<FaidareAggregation> getMainAppAggregations() {
        return FaidareAggregation.MAIN_AGGREGATIONS;
    }

    @Override
    protected PillarAggregationDescriptor getPillarAggregationDescriptor() {
        return PILLAR_AGGREGATION_DESCRIPTOR;
    }

    @Override
    public Set<String> findAllIds(String query, boolean descendants, SearchRefinements refinements) {
        // construct the query, without paging
        NativeSearchQueryBuilder builder = getQueryBuilder(query, refinements, Pageable.unpaged(), descendants);
        // only load the id from the document source
        builder.withFields("id");
        NativeSearchQuery searchQuery = builder.build();
        SearchHits<FaidareDocument> hits = elasticsearchTemplate.search(searchQuery, getDocumentClass());
        return hits.stream().map(hit -> hit.getContent().getId()).collect(Collectors.toSet());
    }

    @Override
    public Set<String> findAllIds(String query, boolean descendants, SearchRefinements refinements, String idFieldName) {
        // construct the query, without paging
        NativeSearchQueryBuilder builder = getQueryBuilder(query, refinements, Pageable.unpaged(), descendants);
        // only load the id from the document source
        builder.withFields(idFieldName);
        NativeSearchQuery searchQuery = builder.build();
        SearchHits<FaidareDocument> hits = elasticsearchTemplate.search(searchQuery, getDocumentClass());
        if (idFieldName.equals("germplasmDbId")){
            return hits.stream().map(hit -> hit.getContent().getGermplasmDbId()).collect(Collectors.toSet());
        }
        return hits.stream().map(hit -> hit.getContent().getId()).collect(Collectors.toSet());
    }

}
