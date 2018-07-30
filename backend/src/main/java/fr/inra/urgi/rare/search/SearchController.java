package fr.inra.urgi.rare.search;

import java.util.List;
import java.util.Optional;

import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.dao.RareAggregation;
import fr.inra.urgi.rare.dao.SearchRefinements;
import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.dto.AggregatedPageDTO;
import org.springframework.data.domain.PageRequest;
import org.springframework.util.MultiValueMap;
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

    public static final int PAGE_SIZE = 20;

    private GeneticResourceDao geneticResourceDao;

    public SearchController(GeneticResourceDao geneticResourceDao) {
        this.geneticResourceDao = geneticResourceDao;
    }

    /**
     * Searches for the given query, and returns an aggregated page of results
     * @param query the query (mandatory parameter)
     * @param page the requested page number, starting at 0. Defaults to 0 if not passed.
     * @param agg if true, the aggregated page's aggregations will be a non-empty array containing all the terms
     * aggregations allowing to refine the query. If false or omitted, the aggregations won't be loaded and the
     * aggregations array in the result will be empty
     * @param parameters all the parameters, containing the refinements based on the aggregations. The names
     * of the other parameters are the names of the agregations, and the values are one of the values for that
     * aggregation.
     *
     * @see fr.inra.urgi.rare.dao.RareAggregation
     */
    @GetMapping
    public AggregatedPageDTO<GeneticResource> search(@RequestParam("query") String query,
                                                     @RequestParam("agg") Optional<Boolean> agg,
                                                     @RequestParam("page") Optional<Integer> page,
                                                     @RequestParam MultiValueMap<String, String> parameters) {
        boolean aggregate = agg.orElse(false);
        return AggregatedPageDTO.fromPage(geneticResourceDao.search(query,
                                                                    aggregate,
                                                                    createRefinementsFromParameters(parameters),
                                                                    PageRequest.of(page.orElse(0), PAGE_SIZE)));

    }

    private SearchRefinements createRefinementsFromParameters(MultiValueMap<String, String> parameters) {
        SearchRefinements.Builder builder = SearchRefinements.builder();
        for (RareAggregation rareAggregation : RareAggregation.values()) {
            List<String> parameterValues = parameters.get(rareAggregation.getName());
            if (parameterValues != null && !parameterValues.isEmpty()) {
                builder.withTerm(rareAggregation, parameterValues);
            }
        }

        return builder.build();
    }
}
