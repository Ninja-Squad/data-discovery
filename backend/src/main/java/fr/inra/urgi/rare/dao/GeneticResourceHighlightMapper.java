package fr.inra.urgi.rare.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import fr.inra.urgi.rare.domain.GeneticResource;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.fetch.subphase.highlight.HighlightField;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.DefaultResultMapper;
import org.springframework.data.elasticsearch.core.EntityMapper;
import org.springframework.data.elasticsearch.core.SearchResultMapper;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;
import org.springframework.data.elasticsearch.core.aggregation.impl.AggregatedPageImpl;

/**
 * A special {@link SearchResultMapper}, only usable for {@link GeneticResource}, which delegates to the
 * default mapper, but then replaces the description in the mapped genetic resources by the highlighted description
 * if it's found in the search response.
 * @author JB Nizet
 */
public class GeneticResourceHighlightMapper implements SearchResultMapper {

    private DefaultResultMapper defaultResultMapper;

    public GeneticResourceHighlightMapper(EntityMapper entityMapper) {
        this.defaultResultMapper = new DefaultResultMapper(entityMapper);
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T> AggregatedPage<T> mapResults(SearchResponse response, Class<T> clazz, Pageable pageable) {
        if (clazz != GeneticResource.class) {
            throw new IllegalArgumentException("The only supported class is " + GeneticResource.class);
        }

        AggregatedPage<GeneticResource> page = defaultResultMapper.mapResults(response, GeneticResource.class, pageable);

        List<GeneticResource> newContent = new ArrayList<>(page.getContent());

        for (int i = 0; i < page.getContent().size(); i++) {
            GeneticResource geneticResource = page.getContent().get(i);
            SearchHit hit = response.getHits().getAt(i);
            Map<String, HighlightField> highlightFields = hit.getHighlightFields();

            String newDescription = geneticResource.getDescription();
            boolean hightlightFound = false;

            if (highlightFields != null) {
                HighlightField descriptionHighlight = highlightFields.get("description");
                if (descriptionHighlight != null && descriptionHighlight.getFragments().length == 1) {
                    newDescription = descriptionHighlight.getFragments()[0].string();
                    hightlightFound = true;
                }
            }

            if (hightlightFound) {
                GeneticResource newGeneticResource = GeneticResource.builder(geneticResource)
                    .withDescription(newDescription)
                    .build();
                newContent.set(i, newGeneticResource);
            }
        }

        return (AggregatedPage<T>) new AggregatedPageImpl<>(newContent,
                                                            page.getPageable(),
                                                            page.getTotalElements(),
                                                            page.getAggregations(),
                                                            page.getScrollId());
    }
}
