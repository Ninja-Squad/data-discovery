package fr.inra.urgi.datadiscovery.germplasm.api;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.faidare.FaidareQualifier;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

/**
 * Service used to query the Faidare API, in particular the export endpoint
 * @author JB Nizet
 */
@Profile(AppProfile.FAIDARE)
@Component
public class FaidareApiService {

    private final WebClient webClient;

    public FaidareApiService(@FaidareQualifier WebClient webClient) {
        this.webClient = webClient;
    }

    public Flux<DataBuffer> export(GermplasmExportCommand command) {
        return webClient.post()
                        .uri("/germplasms/exports")
                        .bodyValue(command)
                        .accept(MediaType.parseMediaType("text/csv"))
                        .retrieve()
                        .bodyToFlux(DataBuffer.class);
    }
}
