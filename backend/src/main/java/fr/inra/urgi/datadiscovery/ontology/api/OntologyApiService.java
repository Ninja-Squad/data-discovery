package fr.inra.urgi.datadiscovery.ontology.api;

import fr.inra.urgi.datadiscovery.ontology.OntologyQualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * The low-lever service allowing to send requests to the BRApi API
 *
 * @author JB Nizet
 */
@Component
public class OntologyApiService {

    private final WebClient webClient;

    public OntologyApiService(@OntologyQualifier WebClient webClient) {
        this.webClient = webClient;
    }

    public Mono<ApiResponse<VariablesResult>> getVariables(int page) {
        return webClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/variables")
                        .queryParam("pageSize", 1000)
                        .queryParam("page", page)
                        .build()
                )
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<ApiResponse<VariablesResult>>() {
                });
    }

    public Mono<ApiResponse<OntologiesResult>> getOntologies(int page) {
        return webClient
            .get()
            .uri(uriBuilder -> uriBuilder
                .path("/v1/ontologies")
                .queryParam("pageSize", 1000)
                .queryParam("page", page)
                .build()
            )
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<ApiResponse<OntologiesResult>>() {
            });
    }
}
