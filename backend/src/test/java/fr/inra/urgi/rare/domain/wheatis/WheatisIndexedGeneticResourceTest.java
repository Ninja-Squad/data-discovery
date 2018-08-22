package fr.inra.urgi.rare.domain.wheatis;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Collections;

import org.junit.jupiter.api.Test;

/**
 * Unit test for {@link WheatisIndexedGeneticResource}
 * @author JB Nizet
 */
class WheatisIndexedGeneticResourceTest {
    @Test
    public void shouldStoreSuggestions() {
        WheatisGeneticResource resource =
            WheatisGeneticResource.builder()
                                  .withId("14_mtDNA")
                                  .withEntryType("Marker")
                                  .withDatabaseName("Evoltree")
                                  .withDescription("14_mtDNA is a RFLP marker. It is used in GD2 database for the species Pinus banksiana.")
                                  .withUrl("http://www.evoltree.eu/zf2/public/elab/details?id=MARKER_14_mtDNA&st=fulltext&page=1")
                                  .withSpecies(Collections.singletonList("Pinus banksiana"))
                                  .withNode("URGI")
                                  .build();

        WheatisIndexedGeneticResource result = new WheatisIndexedGeneticResource(resource);

        assertThat(result.getGeneticResource()).isSameAs(resource);
        assertThat(result.getSuggestions()).containsOnly(
            "14_mtDNA",
            "Marker",
            "Evoltree",
            "14_mtDNA",
            "RFLP",
            "marker",
            "used",
            "GD2",
            "database",
            "species",
            "Pinus",
            "banksiana",
            "Pinus banksiana",
            "URGI"
        );
    }
}
