package fr.inra.urgi.rare.harvest;

import java.net.URI;

import fr.inra.urgi.rare.dao.HarvestResultRepository;
import fr.inra.urgi.rare.exception.NotFoundException;
import fr.inra.urgi.rare.harvest.HarvestResult.HarvestResultBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * A REST controller that can be called (typically using curl or any other command line application)
 * in order to start a harvesting operation. It can also be used to get the result of a given operation,
 * and to list the latest harvesting operations.
 * @author JB Nizet
 */
@RestController
@RequestMapping("/api/harvests")
public class HarvesterController {

    private final AsyncHarvester asyncHarvester;
    private final HarvestResultRepository harvestResultRepository;

    public HarvesterController(AsyncHarvester asyncHarvester,
                               HarvestResultRepository harvestResultRepository) {
        this.asyncHarvester = asyncHarvester;
        this.harvestResultRepository = harvestResultRepository;
    }

    @PostMapping
    public ResponseEntity<?> harvest() {
        HarvestResultBuilder resultBuilder = HarvestResult.builder();
        HarvestResult temporaryHarvestResult = resultBuilder.build();

        harvestResultRepository.save(temporaryHarvestResult);
        asyncHarvester.harvest(resultBuilder);

        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(temporaryHarvestResult.getId())
            .toUri();

        return ResponseEntity.created(location).build();
    }

    @GetMapping("/{id}")
    public HarvestResult get(@PathVariable("id") String id) {
        return harvestResultRepository.findById(id).orElseThrow(NotFoundException::new);
    }
}
