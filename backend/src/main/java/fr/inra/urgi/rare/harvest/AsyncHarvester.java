package fr.inra.urgi.rare.harvest;

import java.util.stream.Stream;

import fr.inra.urgi.rare.dao.HarvestResultRepository;
import fr.inra.urgi.rare.harvest.HarvestResult.HarvestResultBuilder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Bean used to start an asynchronous harvesting job
 * @author JB Nizet
 */
@Component
public class AsyncHarvester {

    private final Harvester harvester;
    private final HarvestResultRepository harvestResultRepository;

    public AsyncHarvester(Harvester harvester, HarvestResultRepository harvestResultRepository) {
        this.harvester = harvester;
        this.harvestResultRepository = harvestResultRepository;
    }

    @Async
    public void harvest(HarvestResultBuilder resultBuilder) {
        try (Stream<HarvestedStream> jsonFiles = this.harvester.jsonFiles(resultBuilder)) {
            jsonFiles.forEach(harvestedStream -> {
                this.harvester.harvest(harvestedStream, resultBuilder);
                harvestResultRepository.save(resultBuilder.build());
            });
        }

        HarvestResult finalResult = resultBuilder.end();
        harvestResultRepository.save(finalResult);
    }
}
