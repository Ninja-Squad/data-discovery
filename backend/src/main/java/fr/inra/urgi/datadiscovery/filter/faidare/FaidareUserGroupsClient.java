package fr.inra.urgi.datadiscovery.filter.faidare;

import java.util.Set;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import org.springframework.context.annotation.Profile;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * A client allowing to load the accessible groups of a Faidare user
 * @author JB Nizet
 */
@Component
@Profile(AppProfile.FAIDARE)
public class FaidareUserGroupsClient {
    private final WebClient webClient;
    private final FaidareUserGroupsProperties properties;

    public FaidareUserGroupsClient(WebClient.Builder webClientBuilder, FaidareUserGroupsProperties properties) {
        this.webClient = webClientBuilder.baseUrl(properties.getUrl()).build();
        this.properties = properties;
    }

    public Mono<Set<Integer>> loadUserGroups(String login) {
        return webClient.get()
                        .uri(builder -> builder.queryParam("token", properties.getToken())
                                               .queryParam("userName", login)
                                               .build())
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<Set<Integer>>() {
                        });
    }
}
