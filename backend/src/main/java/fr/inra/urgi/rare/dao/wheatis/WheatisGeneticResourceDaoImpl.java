package fr.inra.urgi.rare.dao.wheatis;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.rare.dao.AbstractGeneticResourceDaoImpl;
import fr.inra.urgi.rare.dao.AppAggregation;
import fr.inra.urgi.rare.dao.PillarAggregationDescriptor;
import fr.inra.urgi.rare.domain.wheatis.WheatisGeneticResource;
import fr.inra.urgi.rare.domain.wheatis.WheatisIndexedGeneticResource;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.EntityMapper;

/**
 * Implementation of {@link WheatisGeneticResourceDaoCustom}
 * @author JB Nizet
 */
public class WheatisGeneticResourceDaoImpl
    extends AbstractGeneticResourceDaoImpl<WheatisGeneticResource, WheatisIndexedGeneticResource>
    implements WheatisGeneticResourceDaoCustom {

    /**
     * Contains the fields searchable on a {@link WheatisGeneticResource}.
     * This is basically all fields at the exception of the ones containing a URL.
     */
    private static final Set<String> SEARCHABLE_FIELDS = Collections.unmodifiableSet(Stream.of(
        "name",
        "description",
        "entryType",
        "databaseName",
        "node",
        "species"
    ).collect(Collectors.toSet()));

    private static final PillarAggregationDescriptor PILLAR_AGGREGATION_DESCRIPTOR =
        new PillarAggregationDescriptor("node.keyword",
                                        "databaseName.keyword",
                                        null);

    public WheatisGeneticResourceDaoImpl(ElasticsearchTemplate elasticsearchTemplate,
                                         EntityMapper entityMapper) {
        super(elasticsearchTemplate, new WheatisGeneticResourceHighlightMapper(entityMapper));
    }

    @Override
    protected Class<WheatisGeneticResource> getGeneticResourceClass() {
        return WheatisGeneticResource.class;
    }

    @Override
    protected Class<WheatisIndexedGeneticResource> getIndexedGeneticResourceClass() {
        return WheatisIndexedGeneticResource.class;
    }

    @Override
    protected Set<String> getSearchableFields() {
        return SEARCHABLE_FIELDS;
    }

    @Override
    protected List<AppAggregation> getAppAggregations() {
        return Arrays.asList(WheatisAggregation.values());
    }

    @Override
    protected PillarAggregationDescriptor getPillarAggregationDescriptor() {
        return PILLAR_AGGREGATION_DESCRIPTOR;
    }
}
