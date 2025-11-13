package fr.inra.urgi.datadiscovery.germplasm.api;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.faidare.FaidareQualifier;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.buffer.DataBuffer;
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

    public Flux<DataBuffer> exportMcpd(GermplasmMcpdExportCommand command) {
        return webClient.post()
                        .uri("/germplasms/exports/mcpd")
                        .bodyValue(command)
                        .accept(ExportFormat.CSV.getMediaType())
                        .retrieve()
                        .bodyToFlux(DataBuffer.class);
    }

    public Flux<DataBuffer> exportPlantMaterial(GermplasmExportCommand command) {
        return webClient.post()
                        .uri("/germplasms/exports/plant-material")
                        .bodyValue(command)
                        .accept(ExportFormat.CSV.getMediaType())
                        .retrieve()
                        .bodyToFlux(DataBuffer.class);
    }

    public Flux<DataBuffer> exportMiappe(GermplasmMiappeExportCommand command) {
        return webClient.post()
                        .uri("/germplasms/exports/miappe")
                        .bodyValue(command)
                        .accept(command.format().getMediaType())
                        .retrieve()
                        .bodyToFlux(DataBuffer.class);
    }
}
