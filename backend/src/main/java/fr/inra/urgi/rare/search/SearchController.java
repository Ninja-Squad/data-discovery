package fr.inra.urgi.rare.search;

import static org.elasticsearch.index.query.QueryBuilders.multiMatchQuery;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.dto.PageDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * A REST controller for the search API
 */
@RestController
@RequestMapping("/api/genetic-resources")
public class SearchController {

    /**
     * Contains the fields searchable on a {@link GeneticResource}.
     * This is basically all fields at the exception of a few ones like `identifier`,
     * and the ones containing a URL.
     */
    private final Set<String> searchableFields = Stream.of(
            "name",
            "description",
            "pillarName",
            "databaseSource",
            "domain",
            "taxon",
            "family",
            "genus",
            "species",
            "materialType",
            "biotopeType",
            "countryOfOrigin",
            "countryOfCollect"
    ).collect(Collectors.toSet());

    private GeneticResourceDao geneticResourceDao;

    public SearchController(GeneticResourceDao geneticResourceDao) {
        this.geneticResourceDao = geneticResourceDao;
    }

    @GetMapping
    public PageDTO<GeneticResource> search(@RequestParam("query") String query) {
        NativeSearchQuery searchQuery = new NativeSearchQueryBuilder()
                .withQuery(multiMatchQuery(query, searchableFields.toArray(new String[0])))
                .build();
        Page<GeneticResource> geneticResources = geneticResourceDao.search(searchQuery);
        return PageDTO.fromPage(geneticResources);
    }

}
