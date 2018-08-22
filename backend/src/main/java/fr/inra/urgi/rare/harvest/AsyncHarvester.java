package fr.inra.urgi.rare.harvest;

import java.util.stream.Stream;

import fr.inra.urgi.rare.dao.HarvestResultDao;
import fr.inra.urgi.rare.harvest.HarvestResult.HarvestResultBuilder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Bean used to start an asynchronous harvesting job
 * @author JB Nizet
 */
@Component
public class AsyncHarvester {

    private final AbstractHarvester<?, ?> harvester;
    private final HarvestResultDao harvestResultDao;

    public AsyncHarvester(AbstractHarvester harvester, HarvestResultDao harvestResultDao) {
        this.harvester = harvester;
        this.harvestResultDao = harvestResultDao;
    }

    @Async
    public void harvest(HarvestResultBuilder resultBuilder) {
        try (Stream<HarvestedStream> jsonFiles = this.harvester.jsonFiles(resultBuilder)) {
            jsonFiles.forEach(harvestedStream -> {
                this.harvester.harvest(harvestedStream, resultBuilder);
                harvestResultDao.save(resultBuilder.build());
            });
        }

        HarvestResult finalResult = resultBuilder.end();
        harvestResultDao.save(finalResult);
    }
}
