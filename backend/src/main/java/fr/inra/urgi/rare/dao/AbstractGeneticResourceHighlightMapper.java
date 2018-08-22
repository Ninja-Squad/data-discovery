package fr.inra.urgi.rare.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.domain.IndexedGeneticResource;
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
 * A base class for highlight mappers. There is one subclass for each app (RARe, WheatIS, etc.)
 * @author JB Nizet
 */
public abstract class AbstractGeneticResourceHighlightMapper<R extends GeneticResource, I extends IndexedGeneticResource<R>>
    implements SearchResultMapper {

    private DefaultResultMapper defaultResultMapper;

    public AbstractGeneticResourceHighlightMapper(EntityMapper entityMapper) {
        this.defaultResultMapper = new DefaultResultMapper(entityMapper);
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T> AggregatedPage<T> mapResults(SearchResponse response, Class<T> clazz, Pageable pageable) {
        if (clazz != getGeneticResourceClass()) {
            throw new IllegalArgumentException("The only supported class is " + getGeneticResourceClass());
        }

        AggregatedPage<R> page = defaultResultMapper.mapResults(response, getGeneticResourceClass(), pageable);

        List<R> newContent = new ArrayList<>(page.getContent());

        for (int i = 0; i < page.getContent().size(); i++) {
            R geneticResource = page.getContent().get(i);
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
                R newGeneticResource = clone(geneticResource, newDescription);
                newContent.set(i, newGeneticResource);
            }
        }

        return (AggregatedPage<T>) new AggregatedPageImpl<>(newContent,
                                                            page.getPageable(),
                                                            page.getTotalElements(),
                                                            page.getAggregations(),
                                                            page.getScrollId());
    }

    protected abstract Class<R> getGeneticResourceClass();
    protected abstract R clone(R original, String newDescription);
}

