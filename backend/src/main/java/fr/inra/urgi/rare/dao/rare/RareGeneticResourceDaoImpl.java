package fr.inra.urgi.rare.dao.rare;

import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.rare.dao.AbstractGeneticResourceDaoImpl;
import fr.inra.urgi.rare.dao.AppAggregation;
import fr.inra.urgi.rare.domain.rare.RareGeneticResource;
import fr.inra.urgi.rare.domain.rare.RareIndexedGeneticResource;
import org.elasticsearch.index.query.MatchAllQueryBuilder;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.TermsAggregationBuilder;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.EntityMapper;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;

/**
 * Implementation of {@link RareGeneticResourceDaoCustom}
 * @author JB Nizet
 */
public class RareGeneticResourceDaoImpl
    extends AbstractGeneticResourceDaoImpl<RareGeneticResource, RareIndexedGeneticResource>
    implements RareGeneticResourceDaoCustom {

    /**
     * Contains the fields searchable on a {@link RareGeneticResource}.
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

    public RareGeneticResourceDaoImpl(ElasticsearchTemplate elasticsearchTemplate,
                                      EntityMapper entityMapper) {
        super(elasticsearchTemplate, new RareGeneticResourceHighlightMapper(entityMapper));
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

        AggregatedPage<RareGeneticResource> geneticResources = elasticsearchTemplate.queryForPage(builder.build(),
                                                                                                  RareGeneticResource.class);
        return geneticResources.getAggregations().get(pillarAggregationName);
    }

    @Override
    public Comparator<Terms> getAggregationComparator() {
        return RareAggregation.TERMS_COMPARATOR;
    }

    @Override
    protected Class<RareGeneticResource> getGeneticResourceClass() {
        return RareGeneticResource.class;
    }

    @Override
    protected Class<RareIndexedGeneticResource> getIndexedGeneticResourceClass() {
        return RareIndexedGeneticResource.class;
    }

    @Override
    protected Set<String> getSearchableFields() {
        return SEARCHABLE_FIELDS;
    }

    @Override
    protected List<AppAggregation> getAppAggregations() {
        return Arrays.asList(RareAggregation.values());
    }
}
