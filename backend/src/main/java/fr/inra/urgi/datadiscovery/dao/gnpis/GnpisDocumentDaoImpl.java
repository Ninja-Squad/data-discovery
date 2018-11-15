package fr.inra.urgi.datadiscovery.dao.gnpis;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.datadiscovery.dao.AbstractDocumentDaoImpl;
import fr.inra.urgi.datadiscovery.dao.AppAggregation;
import fr.inra.urgi.datadiscovery.dao.PillarAggregationDescriptor;
import fr.inra.urgi.datadiscovery.domain.gnpis.GnpisDocument;
import fr.inra.urgi.datadiscovery.domain.gnpis.GnpisIndexedDocument;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.EntityMapper;

/**
 * Implementation of {@link GnpisDocumentDaoCustom}
 * @author JB Nizet
 */
public class GnpisDocumentDaoImpl
    extends AbstractDocumentDaoImpl<GnpisDocument, GnpisIndexedDocument>
    implements GnpisDocumentDaoCustom {

    /**
     * Contains the fields searchable on a {@link GnpisDocument}.
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

    public GnpisDocumentDaoImpl(ElasticsearchTemplate elasticsearchTemplate,
                                  EntityMapper entityMapper) {
        super(elasticsearchTemplate, new GnpisDocumentHighlightMapper(entityMapper));
    }

    @Override
    protected Class<GnpisDocument> getDocumentClass() {
        return GnpisDocument.class;
    }

    @Override
    protected Class<GnpisIndexedDocument> getIndexedDocumentClass() {
        return GnpisIndexedDocument.class;
    }

    @Override
    protected Set<String> getSearchableFields() {
        return SEARCHABLE_FIELDS;
    }

    @Override
    protected List<AppAggregation> getAppAggregations() {
        return Arrays.asList(GnpisAggregation.values());
    }

    @Override
    protected PillarAggregationDescriptor getPillarAggregationDescriptor() {
        return PILLAR_AGGREGATION_DESCRIPTOR;
    }
}
