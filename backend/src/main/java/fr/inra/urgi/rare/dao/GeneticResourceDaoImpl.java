package fr.inra.urgi.rare.dao;

import static org.elasticsearch.index.query.QueryBuilders.multiMatchQuery;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.rare.domain.GeneticResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;

/**
 * Implementation of {@link GeneticResourceDaoCustom}
 * @author JB Nizet
 */
public class GeneticResourceDaoImpl implements GeneticResourceDaoCustom {

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
    public Page<GeneticResource> search(String query, Pageable page) {
        NativeSearchQuery searchQuery = new NativeSearchQueryBuilder()
            .withQuery(multiMatchQuery(query, SEARCHABLE_FIELDS.toArray(new String[0])))
            .withPageable(page)
            .build();
        return elasticsearchTemplate.queryForPage(searchQuery, GeneticResource.class);
    }
}
