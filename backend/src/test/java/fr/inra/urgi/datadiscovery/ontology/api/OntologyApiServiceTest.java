package fr.inra.urgi.datadiscovery.ontology.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.File;
import java.io.IOException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import fr.inra.urgi.datadiscovery.ontology.OntologyConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.context.annotation.Import;

/**
 * Integration test for {@link OntologyApiService}
 *
 * @author JB Nizet
 */
@RestClientTest
@Import({OntologyConfig.class, OntologyApiService.class})
class OntologyApiServiceTest {
    @Autowired
    private OntologyApiService service;

    @Test
    void shouldGetVariables() throws IOException {
        ApiResponse<VariablesResult> response = service.getVariables(0).block();
        assertThat(response.getMetadata().getPagination().getPageSize()).isEqualTo(1000);
        assertThat(response.getResult().getVariables()).isNotEmpty();

        ObjectMapper objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
        objectMapper.writeValue(new File("variables.json"), response.getResult().getVariables());
    }
}
