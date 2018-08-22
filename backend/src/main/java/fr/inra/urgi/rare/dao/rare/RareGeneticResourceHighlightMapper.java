package fr.inra.urgi.rare.dao.rare;

import fr.inra.urgi.rare.dao.AbstractGeneticResourceHighlightMapper;
import fr.inra.urgi.rare.domain.rare.RareGeneticResource;
import org.springframework.data.elasticsearch.core.EntityMapper;
import org.springframework.data.elasticsearch.core.SearchResultMapper;

/**
 * A special {@link SearchResultMapper}, only usable for {@link RareGeneticResource}, which delegates to the
 * default mapper, but then replaces the description in the mapped genetic resources by the highlighted description
 * if it's found in the search response.
 * @author JB Nizet
 */
public class RareGeneticResourceHighlightMapper
    extends AbstractGeneticResourceHighlightMapper<RareGeneticResource> {

    public RareGeneticResourceHighlightMapper(EntityMapper entityMapper) {
        super(entityMapper);
    }

    @Override
    protected Class<RareGeneticResource> getGeneticResourceClass() {
        return RareGeneticResource.class;
    }

    @Override
    protected RareGeneticResource clone(RareGeneticResource geneticResource, String newDescription) {
        return RareGeneticResource.builder(geneticResource).withDescription(newDescription).build();
    }
}
