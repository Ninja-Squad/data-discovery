package fr.inra.urgi.rare.pillar;

import java.util.List;
import java.util.stream.Collectors;

import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.dao.rare.RareGeneticResourceDao;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms.Bucket;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller used to get the information, displayed in the home page, about pillars.
 * @author JB Nizet
 */
@RestController
@RequestMapping("/api/pillars")
public class PillarController {

    private final GeneticResourceDao<?, ?> geneticResourceDao;

    public PillarController(RareGeneticResourceDao geneticResourceDao) {
        this.geneticResourceDao = geneticResourceDao;
    }

    @GetMapping
    public List<PillarDTO> list() {
        Terms pillars = geneticResourceDao.findPillars();
        return pillars.getBuckets()
                      .stream()
                      .map(this::toPillarDTO)
                      .collect(Collectors.toList());
    }

    private PillarDTO toPillarDTO(Bucket bucket) {
        String name = bucket.getKeyAsString();
        Terms databaseSourceAggregation =
            bucket.getAggregations().get(GeneticResourceDao.DATABASE_SOURCE_AGGREGATION_NAME);

        List<DatabaseSourceDTO> databaseSources =
            databaseSourceAggregation.getBuckets()
                                     .stream()
                                     .map(this::toDatabaseSourceDTO)
                                     .collect(Collectors.toList());

        return new PillarDTO(name, databaseSources);
    }

    private DatabaseSourceDTO toDatabaseSourceDTO(Bucket bucket) {
        String name = bucket.getKeyAsString();
        Terms portalURLAggregation =
            bucket.getAggregations().get(GeneticResourceDao.PORTAL_URL_AGGREGATION_NAME);

        List<? extends Bucket> buckets = portalURLAggregation.getBuckets();

        // there should be 0 bucket (if the database source has no portal URL), or 1 if it has one.
        // if there are more, we only take the first one, which has the most documents: it probably means
        // that the other buckets have a wrong URL
        String url = buckets.size() > 0 ? buckets.get(0).getKeyAsString() : null;

        return new DatabaseSourceDTO(name, url, bucket.getDocCount());
    }
}
