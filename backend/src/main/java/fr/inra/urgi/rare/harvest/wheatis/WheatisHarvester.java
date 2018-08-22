package fr.inra.urgi.rare.harvest.wheatis;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.rare.config.AppProfile;
import fr.inra.urgi.rare.config.RareProperties;
import fr.inra.urgi.rare.dao.wheatis.WheatisGeneticResourceDao;
import fr.inra.urgi.rare.domain.wheatis.WheatisGeneticResource;
import fr.inra.urgi.rare.domain.wheatis.WheatisIndexedGeneticResource;
import fr.inra.urgi.rare.harvest.AbstractHarvester;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * The Harvester of the RARe application
 * @author JB Nizet
 */
@Component
@Profile(AppProfile.WHEATIS)
public class WheatisHarvester extends AbstractHarvester<WheatisGeneticResource, WheatisIndexedGeneticResource> {

    public WheatisHarvester(RareProperties rareProperties,
                            ObjectMapper objectMapper,
                            WheatisGeneticResourceDao geneticResourceDao) {
        super(rareProperties, objectMapper, geneticResourceDao);
    }

    @Override
    protected Class<WheatisGeneticResource> getGeneticResourceClass() {
        return WheatisGeneticResource.class;
    }

    @Override
    protected WheatisIndexedGeneticResource toIndexedGeneticResource(WheatisGeneticResource geneticResource) {
        return new WheatisIndexedGeneticResource(geneticResource);
    }
}
