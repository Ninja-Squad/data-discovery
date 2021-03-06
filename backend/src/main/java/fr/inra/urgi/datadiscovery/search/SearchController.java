package fr.inra.urgi.datadiscovery.search;

import java.util.List;
import java.util.Optional;

import fr.inra.urgi.datadiscovery.dao.AggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.AggregationSelection;
import fr.inra.urgi.datadiscovery.dao.AppAggregation;
import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.dao.SortAnalyzer;
import fr.inra.urgi.datadiscovery.domain.AggregatedPage;
import fr.inra.urgi.datadiscovery.domain.SearchDocument;
import fr.inra.urgi.datadiscovery.dto.AggregatedPageDTO;
import fr.inra.urgi.datadiscovery.dto.AggregationDTO;
import fr.inra.urgi.datadiscovery.dto.PageDTO;
import fr.inra.urgi.datadiscovery.exception.BadRequestException;
import org.springframework.data.domain.PageRequest;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * A REST controller for the search API
 */
@RestController
public class SearchController {

    public static final int PAGE_SIZE = 20;

    /**
     * The maximum number of results that Elasticsearch accepts to paginate.
     */
    public static final int MAX_RESULTS = PageDTO.MAX_RESULTS;

    private final DocumentDao<?> documentDao;
    private final AggregationAnalyzer aggregationAnalyzer;
    private final SortAnalyzer sortAnalyzer;

    public SearchController(DocumentDao<?> documentDao,
                            AggregationAnalyzer aggregationAnalyzer,
                            SortAnalyzer sortAnalyzer) {
        this.documentDao = documentDao;
        this.aggregationAnalyzer = aggregationAnalyzer;
        this.sortAnalyzer = sortAnalyzer;
    }

    /**
     * Searches for the given query, and returns an aggregated page of results
     * @param query the query (mandatory parameter)
     * @param page the requested page number, starting at 0. Defaults to 0 if not passed.
     * @param parameters all the parameters, containing the refinements based on the aggregations. The names
     * of the other parameters are the names of the agregations, and the values are one of the values for that
     * aggregation.
     *
     * @see AppAggregation
     */
    @GetMapping("/api/search")
    public PageDTO<? extends SearchDocument> search(@RequestParam(value = "query", defaultValue = "") String query,
                                                              @RequestParam("highlight") Optional<Boolean> highlight,
                                                              @RequestParam("descendants") Optional<Boolean> descendants,
                                                              @RequestParam("page") Optional<Integer> page,
                                                              @RequestParam("sort") Optional<String> sort,
                                                              @RequestParam("direction") Optional<String> direction,
                                                              @RequestParam MultiValueMap<String, String> parameters) {
        int requestedPage = page.orElse(0);
        validatePage(requestedPage);
        AggregatedPage<? extends SearchDocument> aggregatedPage = documentDao.search(
                query,
                highlight.orElse(false),
                descendants.orElse(false),
                createRefinementsFromParameters(parameters),
                PageRequest.of(page.orElse(0),
                               PAGE_SIZE,
                               sortAnalyzer.createSort(sort.orElse(null), direction.orElse(null)))
        );
        return PageDTO.fromPage(aggregatedPage);
    }

    @GetMapping("/api/aggregate")
    public List<AggregationDTO> aggregate(@RequestParam(value = "query", defaultValue = "") String query,
                                          @RequestParam MultiValueMap<String, String> parameters,
                                          @RequestParam("descendants") Optional<Boolean> descendants,
                                          @RequestParam("main") Optional<Boolean> mainAggregationsOnly) {

        AggregationSelection aggregationSelection = mainAggregationsOnly.orElse(false) ? AggregationSelection.MAIN : AggregationSelection.ALL;
        AggregatedPage<? extends SearchDocument> aggregatedPage = documentDao.aggregate(query,
                createRefinementsFromParameters(parameters),
                aggregationSelection,
                descendants.orElse(false));
        return AggregatedPageDTO.fromPage(aggregatedPage, aggregationAnalyzer).getAggregations();
    }

    private SearchRefinements createRefinementsFromParameters(MultiValueMap<String, String> parameters) {
        SearchRefinements.Builder builder = SearchRefinements.builder();
        for (AppAggregation appAggregation : aggregationAnalyzer.getAggregations()) {
            List<String> parameterValues = parameters.get(appAggregation.getName());
            if (parameterValues != null && !parameterValues.isEmpty()) {
                builder.withTerm(appAggregation, parameterValues);
            }
        }

        return builder.build();
    }

    private void validatePage(int requestedPage) {
        int maxPage = MAX_RESULTS / PAGE_SIZE;
        if (requestedPage >= maxPage) {
            throw new BadRequestException("The requested page is too high. It must be less than " + maxPage);
        }
    }
}
