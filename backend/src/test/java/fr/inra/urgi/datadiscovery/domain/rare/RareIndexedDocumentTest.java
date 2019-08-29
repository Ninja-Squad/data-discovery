package fr.inra.urgi.datadiscovery.domain.rare;

import java.util.Arrays;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit test for {@link RareIndexedDocument}
 * @author JB Nizet
 */
@Deprecated
class RareIndexedDocumentTest {
    @Test
    public void shouldStoreSuggestions() {
        RareDocument resource = RareDocument.builder()
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

        RareIndexedDocument result = new RareIndexedDocument(resource);

        assertThat(result.getDocument()).isSameAs(resource);
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
