package fr.inra.urgi.rare.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;

import org.junit.jupiter.api.Test;

/**
 * Unit test for {@link IndexedGeneticResource}
 * @author JB Nizet
 */
class IndexedGeneticResourceTest {
    @Test
    public void shouldStoreSuggestions() {
        GeneticResource resource = GeneticResource.builder()
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
            .withDescription("Hello world! How\n is he/she doing? Très bien. GrapeReSeq_Illumina_20K_experiment?")
            .build();

        IndexedGeneticResource result = new IndexedGeneticResource(resource);

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
