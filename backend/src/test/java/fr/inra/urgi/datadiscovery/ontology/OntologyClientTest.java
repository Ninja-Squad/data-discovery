package fr.inra.urgi.datadiscovery.ontology;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import fr.inra.urgi.datadiscovery.ontology.api.ApiResponse;
import fr.inra.urgi.datadiscovery.ontology.api.Metadata;
import fr.inra.urgi.datadiscovery.ontology.api.OntologiesResult;
import fr.inra.urgi.datadiscovery.ontology.api.Ontology;
import fr.inra.urgi.datadiscovery.ontology.api.OntologyApiService;
import fr.inra.urgi.datadiscovery.ontology.api.Pagination;
import fr.inra.urgi.datadiscovery.ontology.api.Variable;
import fr.inra.urgi.datadiscovery.ontology.api.VariablesResult;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

/**
 * Unit tests for {@link OntologyClient}
 * @author JB Nizet
 */
class OntologyClientTest {
    @Nested
    class Variables {
        @Test
        void shouldGetAllVariables() {
            OntologyApiService mockApiService = mock(OntologyApiService.class);

            when(mockApiService.getVariables(0)).thenReturn(Mono.just(createResult(0)));
            when(mockApiService.getVariables(1)).thenReturn(Mono.just(createResult(1)));
            when(mockApiService.getVariables(2)).thenReturn(Mono.just(createResult(2)));

            OntologyClient client = new OntologyClient(mockApiService);
            List<Variable> result = client.getAllVariables().block();
            assertThat(result).hasSize(30);
            for (int i = 0; i < result.size(); i++) {
                assertThat(result.get(i).getName()).isEqualTo("name-" + i);
            }
        }

        private ApiResponse<VariablesResult> createResult(int page) {
            Metadata metadata = new Metadata(
                new Pagination(page, 10, 30, 3)
            );
            VariablesResult result = new VariablesResult(
                IntStream.range(10 * page, 10 * (page + 1))
                         .mapToObj(this::createVariable)
                         .collect(Collectors.toList())
            );
            return new ApiResponse<>(metadata, result);
        }

        private Variable createVariable(int i) {
            return Variable.builder().withName("name-" + i).build();
        }
    }

    @Nested
    class Ontologies {
        @Test
        void shouldGetAllOntologies() {
            OntologyApiService mockApiService = mock(OntologyApiService.class);

            when(mockApiService.getOntologies(0)).thenReturn(Mono.just(createResult(0)));
            when(mockApiService.getOntologies(1)).thenReturn(Mono.just(createResult(1)));
            when(mockApiService.getOntologies(2)).thenReturn(Mono.just(createResult(2)));

            OntologyClient client = new OntologyClient(mockApiService);
            List<Ontology> result = client.getAllOntologies().block();
            assertThat(result).hasSize(30);
            for (int i = 0; i < result.size(); i++) {
                assertThat(result.get(i).getOntologyName()).isEqualTo("name-" + i);
            }
        }

        private ApiResponse<OntologiesResult> createResult(int page) {
            Metadata metadata = new Metadata(
                new Pagination(page, 10, 30, 3)
            );
            OntologiesResult result = new OntologiesResult(
                IntStream.range(10 * page, 10 * (page + 1))
                         .mapToObj(this::createOntology)
                         .collect(Collectors.toList())
            );
            return new ApiResponse<>(metadata, result);
        }

        private Ontology createOntology(int i) {
            return Ontology.builder().withOntologyName("name-" + i).build();
        }
    }
}
