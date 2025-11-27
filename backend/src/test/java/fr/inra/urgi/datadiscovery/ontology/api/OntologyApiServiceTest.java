package fr.inra.urgi.datadiscovery.ontology.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;

import fr.inra.urgi.datadiscovery.ontology.OntologyConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webclient.test.autoconfigure.WebClientTest;
import org.springframework.context.annotation.Import;

/**
 * Integration test for {@link OntologyApiService}
 *
 * @author JB Nizet
 */
@WebClientTest
@Import({OntologyConfig.class, OntologyApiService.class})
class OntologyApiServiceTest {
    @Autowired
    private OntologyApiService service;

    @Test
    void shouldGetVariables() throws IOException {
        ApiResponse<VariablesResult> response = service.getVariables(0).block();
        assertThat(response.getMetadata().getPagination().getPageSize()).isEqualTo(1000);
        assertThat(response.getResult().getVariables()).isNotEmpty();
    }

    @Test
    void shouldGetOntologies() throws IOException {
        ApiResponse<OntologiesResult> response = service.getOntologies(0).block();
        assertThat(response.getMetadata().getPagination().getPageSize()).isEqualTo(1000);
        assertThat(response.getResult().getOntologies()).isNotEmpty();
    }
}
