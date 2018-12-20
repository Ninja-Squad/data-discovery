package fr.inra.urgi.datadiscovery.harvest;

import java.net.URI;
import java.util.Optional;

import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import fr.inra.urgi.datadiscovery.dao.HarvestResultDao;
import fr.inra.urgi.datadiscovery.dto.PageDTO;
import fr.inra.urgi.datadiscovery.exception.NotFoundException;
import fr.inra.urgi.datadiscovery.harvest.HarvestResult.HarvestResultBuilder;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    public static final int PAGE_SIZE = 10;

    private final AsyncHarvester asyncHarvester;
    private final HarvestResultDao harvestResultDao;
    private final DocumentDao<?, ?> documentDao;

    public HarvesterController(AsyncHarvester asyncHarvester,
                               HarvestResultDao harvestResultDao,
                               DocumentDao<?, ?> documentDao) {
        this.asyncHarvester = asyncHarvester;
        this.harvestResultDao = harvestResultDao;
        this.documentDao = documentDao;
    }

    @PostMapping
    public ResponseEntity<?> harvest() {
        this.documentDao.putMapping();

        HarvestResultBuilder resultBuilder = HarvestResult.builder();
        HarvestResult temporaryHarvestResult = resultBuilder.build();

        harvestResultDao.save(temporaryHarvestResult);
        asyncHarvester.harvest(resultBuilder);

        return ResponseEntity.created(toDetail(temporaryHarvestResult.getId())).build();
    }

    @GetMapping("/{id}")
    public HarvestResult get(@PathVariable("id") String id) {
        return harvestResultDao.findById(id).orElseThrow(NotFoundException::new);
    }

    @GetMapping
    public PageDTO<LightHarvestResultDTO> list(@RequestParam(name = "page") Optional<Integer> page) {
        return PageDTO.fromPage(
            harvestResultDao.list(PageRequest.of(page.orElse(0), PAGE_SIZE)),
            result -> new LightHarvestResultDTO(result.getId(),
                                                toDetail(result.getId()).toString(),
                                                result.getStartInstant(),
                                                result.getEndInstant(),
                                                result.getDuration())
        );
    }

    private URI toDetail(String id) {
        return ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(id)
            .toUri();
    }
}
