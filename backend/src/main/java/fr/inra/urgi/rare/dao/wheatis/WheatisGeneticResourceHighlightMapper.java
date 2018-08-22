package fr.inra.urgi.rare.dao.wheatis;

import fr.inra.urgi.rare.dao.AbstractGeneticResourceHighlightMapper;
import fr.inra.urgi.rare.domain.wheatis.WheatisGeneticResource;
import org.springframework.data.elasticsearch.core.EntityMapper;
import org.springframework.data.elasticsearch.core.SearchResultMapper;

/**
 * A special {@link SearchResultMapper}, only usable for {@link WheatisGeneticResource}, which delegates to the
 * default mapper, but then replaces the description in the mapped genetic resources by the highlighted description
 * if it's found in the search response.
 * @author JB Nizet
 */
public class WheatisGeneticResourceHighlightMapper
    extends AbstractGeneticResourceHighlightMapper<WheatisGeneticResource> {

    public WheatisGeneticResourceHighlightMapper(EntityMapper entityMapper) {
        super(entityMapper);
    }

    @Override
    protected Class<WheatisGeneticResource> getGeneticResourceClass() {
        return WheatisGeneticResource.class;
    }

    @Override
    protected WheatisGeneticResource clone(WheatisGeneticResource geneticResource, String newDescription) {
        return WheatisGeneticResource.builder(geneticResource).withDescription(newDescription).build();
    }
}
