package fr.inra.urgi.datadiscovery.ontology;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * Unit tests for {@link TraitClassIdGenerator}
 * @author JB Nizet
 */
class TraitClassIdGeneratorTest {
    @Test
    void shouldCreateId() {
        String id = new TraitClassIdGenerator().generateId("CO_333", "Abiotic stress");
        assertThat(id).isNotBlank();
        for (char c : id.toCharArray()) {
            assertThat(Character.isLetterOrDigit(c)).isTrue();
        }
    }
}
