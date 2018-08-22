package fr.inra.urgi.rare.harvest.rare;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.rare.config.AppProfile;
import fr.inra.urgi.rare.config.RareProperties;
import fr.inra.urgi.rare.dao.rare.RareGeneticResourceDao;
import fr.inra.urgi.rare.domain.rare.RareGeneticResource;
import fr.inra.urgi.rare.domain.rare.RareIndexedGeneticResource;
import fr.inra.urgi.rare.harvest.AbstractHarvester;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * The Harvester of the RARe application
 * @author JB Nizet
 */
@Component
@Profile(AppProfile.RARE)
public class RareHarvester extends AbstractHarvester<RareGeneticResource, RareIndexedGeneticResource> {

    public RareHarvester(RareProperties rareProperties,
                         ObjectMapper objectMapper,
                         RareGeneticResourceDao geneticResourceDao) {
        super(rareProperties, objectMapper, geneticResourceDao);
    }

    @Override
    protected Class<RareGeneticResource> getGeneticResourceClass() {
        return RareGeneticResource.class;
    }

    @Override
    protected RareIndexedGeneticResource toIndexedGeneticResource(RareGeneticResource geneticResource) {
        return new RareIndexedGeneticResource(geneticResource);
    }
}
