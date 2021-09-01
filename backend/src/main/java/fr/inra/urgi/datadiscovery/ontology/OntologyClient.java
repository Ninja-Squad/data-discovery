package fr.inra.urgi.datadiscovery.ontology;

import java.util.List;
import java.util.stream.Collectors;

import fr.inra.urgi.datadiscovery.ontology.api.Ontology;
import fr.inra.urgi.datadiscovery.ontology.api.OntologyApiService;
import fr.inra.urgi.datadiscovery.ontology.api.Variable;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * A higher-level client for the BrAPI API, delegating to the low-level {@link OntologyApiService}
 * @author JB Nizet
 */
@Component
public class OntologyClient {
    private final OntologyApiService ontologyApiService;

    public OntologyClient(OntologyApiService ontologyApiService) {
        this.ontologyApiService = ontologyApiService;
    }

    /**
     * Load all the variables from the BrAPI API. Since the API is paginated and accepts a maximum of 1000
     * elements per page, this method recursively calls the endpoint until all the pages are available, and returns them as a list.
     */
    public Mono<List<Variable>> getAllVariables() {
        return this.ontologyApiService
                .getVariables(0)
                .expand(apiResponse -> {
                    int currentPage = apiResponse.getMetadata().getPagination().getCurrentPage();
                    int totalPages = apiResponse.getMetadata().getPagination().getTotalPages();
                    if (currentPage < totalPages - 1) {
                        return this.ontologyApiService.getVariables(apiResponse.getMetadata().getPagination().getCurrentPage() + 1);
                    } else {
                        return Mono.empty();
                    }
                }).map(apiResponse -> apiResponse.getResult().getVariables())
                .flatMapIterable(variables -> variables)
                .collect(Collectors.toList());
    }

    /**
     * Load all the ontologies from the BrAPI API. Since the API is paginated and accepts a maximum of 1000
     * elements per page, this method recursively calls the endpoint until all the pages are available, and returns them as a list.
     */
    public Mono<List<Ontology>> getAllOntologies() {
        return this.ontologyApiService
            .getOntologies(0)
            .expand(apiResponse -> {
                int currentPage = apiResponse.getMetadata().getPagination().getCurrentPage();
                int totalPages = apiResponse.getMetadata().getPagination().getTotalPages();
                if (currentPage < totalPages - 1) {
                    return this.ontologyApiService.getOntologies(apiResponse.getMetadata().getPagination().getCurrentPage() + 1);
                } else {
                    return Mono.empty();
                }
            }).map(apiResponse -> apiResponse.getResult().getOntologies())
            .flatMapIterable(ontologies -> ontologies)
            .collect(Collectors.toList());
    }
}
