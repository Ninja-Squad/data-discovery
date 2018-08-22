package fr.inra.urgi.rare.domain.rare;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;

import fr.inra.urgi.rare.domain.rare.RareGeneticResource;
import fr.inra.urgi.rare.domain.rare.RareIndexedGeneticResource;
import org.junit.jupiter.api.Test;

/**
 * Unit test for {@link RareIndexedGeneticResource}
 * @author JB Nizet
 */
class RareIndexedGeneticResourceTest {
    @Test
    public void shouldStoreSuggestions() {
        RareGeneticResource resource = RareGeneticResource.builder()
                                                          .withDatabaseSource("databaseResource")
                                                          .withFamily(Arrays.asList("family"))
                                                          .withName("name")
                                                          .withTaxon(Arrays.asList("taxon"))
                                                          .withBiotopeType(Arrays.asList("biotopeType"))
                                                          .withCountryOfCollect("countryOfCollect")
                                                          .withCountryOfOrigin("countryOfOrigin")
                                                          .withDomain("domain")
                                                          .withGenus(Arrays.asList("genus"))
                                                          .withMaterialType(Arrays.asList("materialType"))
                                                          .withPillarName("pillarName")
                                                          .withSpecies(Arrays.asList("species"))
                                                          .withDescription("Hello the world! How\n is he/she doing? Très bien. With GrapeReSeq_Illumina_20K_experiment?")
                                                          .build();

        RareIndexedGeneticResource result = new RareIndexedGeneticResource(resource);

        assertThat(result.getGeneticResource()).isSameAs(resource);
        assertThat(result.getSuggestions()).containsOnly(
            "databaseResource",
            "family",
            "name",
            "taxon",
            "biotopeType",
            "countryOfCollect",
            "countryOfOrigin",
            "domain",
            "genus",
            "materialType",
            "pillarName",
            "species",
            "Hello",
            "world",
            "How",
            "she",
            "doing",
            "Très",
            "bien",
            "GrapeReSeq_Illumina_20K_experiment"
        );
    }
}
