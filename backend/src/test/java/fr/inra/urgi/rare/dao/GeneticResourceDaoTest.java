package fr.inra.urgi.rare.dao;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.function.BiConsumer;

import fr.inra.urgi.rare.config.ElasticSearchConfig;
import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.domain.GeneticResourceBuilder;
import fr.inra.urgi.rare.domain.IndexedGeneticResource;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms.Bucket;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@TestPropertySource("/test.properties")
@Import(ElasticSearchConfig.class)
@JsonTest
class GeneticResourceDaoTest {

    @Autowired
    private GeneticResourceDao geneticResourceDao;

    private Pageable firstPage = PageRequest.of(0, 10);

    @BeforeEach
    void prepare() {
        geneticResourceDao.deleteAll();
    }

    @Test
    void shouldSaveAndGet() {

        GeneticResource geneticResource =
                new GeneticResource(
                        "doi:10.15454/1.492178535151698E12",
                        "Grecanico dorato",
                        "Grecanico dorato is a Vitis vinifera subsp vinifera cv. Garganega accession (number: "
                                + "1310Mtp1, doi:10.15454/1.492178535151698E12) maintained by the GRAPEVINE (managed by INRA) and held "
                                + "by INRA. It is a maintained/maintenu accession of biological status traditional cultivar/cultivar "
                                + "traditionnel",
                        "Plant",
                        "Florilège",
                        "http://florilege.arcad-project.org/fr/collections",
                        "https://urgi.versailles.inra.fr/gnpis-core/#accessionCard/id=ZG9pOjEwLjE1NDU0LzEuNDkyMTc4NTM1MTUxNjk4RTEy",
                        "Plantae",
                        Collections.singletonList("Vitis vinifera"),
                        Collections.singletonList("Vitaceae"),
                        Collections.singletonList("Vitis"),
                        Collections.singletonList("Vitis vinifera"),
                        Collections.singletonList("testMaterialType"),
                        Collections.singletonList("testBiotopeType"),
                        "France",
                        0.1,
                        0.2,
                        "Italy",
                        37.5,
                        15.099722);

        geneticResourceDao.saveAll(Collections.singleton(new IndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.findById(geneticResource.getId()).get()).isEqualTo(geneticResource);
    }

    @Test
    public void shouldSearchOnName() {
        shouldSearch(GeneticResourceBuilder::withName);
    }

    @Test
    public void shouldSearchOnDescription() {
        shouldSearch(GeneticResourceBuilder::withDescription);
    }

    @Test
    public void shouldSearchOnPillarName() {
        shouldSearch(GeneticResourceBuilder::withPillarName);
    }

    @Test
    public void shouldSearchOnDatabaseSource() {
        shouldSearch(GeneticResourceBuilder::withDatabaseSource);
    }

    @Test
    public void shouldSearchOnDomain() {
        shouldSearch(GeneticResourceBuilder::withDomain);
    }

    @Test
    public void shouldSearchOnTaxon() {
        shouldSearch((b, s) -> b.withTaxon(Collections.singletonList(s)));
    }

    @Test
    public void shouldSearchOnFamily() {
        shouldSearch((b, s) -> b.withFamily(Collections.singletonList(s)));
    }

    @Test
    public void shouldSearchOnGenus() {
        shouldSearch((b, s) -> b.withGenus(Collections.singletonList(s)));
    }

    @Test
    public void shouldSearchOnSpecies() {
        shouldSearch((b, s) -> b.withSpecies(Collections.singletonList(s)));
    }

    @Test
    public void shouldSearchOnMaterialType() {
        shouldSearch((b, s) -> b.withMaterialType(Collections.singletonList(s)));
    }

    @Test
    public void shouldSearchOnBiotopeType() {
        shouldSearch((b, s) -> b.withBiotopeType(Collections.singletonList(s)));
    }

    @Test
    public void shouldSearchOnCountryOfOrigin() {
        shouldSearch(GeneticResourceBuilder::withCountryOfOrigin);
    }

    @Test
    public void shouldSearchOnCountryOfCollect() {
        shouldSearch(GeneticResourceBuilder::withCountryOfCollect);
    }

    @Test
    public void shouldNotSearchOnIdentifier() {
        GeneticResource geneticResource = new GeneticResourceBuilder().withId("foo-bar").build();
        geneticResourceDao.save(geneticResource);

        assertThat(geneticResourceDao.search(geneticResource.getId(),
                                             false,
                                             SearchRefinements.EMPTY,
                                             firstPage).getContent()).isEmpty();
    }

    @Test
    public void shouldNotSearchOnUrls() {
        GeneticResource geneticResource =
            new GeneticResourceBuilder().withDataURL("foo bar baz").withPortalURL("foo bar baz").build();
        geneticResourceDao.save(geneticResource);

        assertThat(geneticResourceDao.search("bar",
                                             false,
                                             SearchRefinements.EMPTY,
                                             firstPage).getContent()).isEmpty();
    }

    @Test
    public void shouldSuggestOnName() {
        shouldSuggest(GeneticResourceBuilder::withName);
    }

    @Test
    public void shouldSuggestOnPillarName() {
        shouldSuggest(GeneticResourceBuilder::withPillarName);
    }

    @Test
    public void shouldSuggestOnDatabaseSource() {
        shouldSuggest(GeneticResourceBuilder::withDatabaseSource);
    }

    @Test
    public void shouldSuggestOnDomain() {
        shouldSuggest(GeneticResourceBuilder::withDomain);
    }

    @Test
    public void shouldSuggestOnTaxon() {
        shouldSuggest((b, s) -> b.withTaxon(Collections.singletonList(s)));
    }

    @Test
    public void shouldSuggestOnFamily() {
        shouldSuggest((b, s) -> b.withFamily(Collections.singletonList(s)));
    }

    @Test
    public void shouldSuggestOnGenus() {
        shouldSuggest((b, s) -> b.withGenus(Collections.singletonList(s)));
    }

    @Test
    public void shouldSuggestOnSpecies() {
        shouldSuggest((b, s) -> b.withSpecies(Collections.singletonList(s)));
    }

    @Test
    public void shouldSuggestOnMaterialType() {
        shouldSuggest((b, s) -> b.withMaterialType(Collections.singletonList(s)));
    }

    @Test
    public void shouldSuggestOnBiotopeType() {
        shouldSuggest((b, s) -> b.withBiotopeType(Collections.singletonList(s)));
    }

    @Test
    public void shouldSuggestOnCountryOfOrigin() {
        shouldSuggest(GeneticResourceBuilder::withCountryOfOrigin);
    }

    @Test
    public void shouldSuggestOnCountryOfCollect() {
        shouldSuggest(GeneticResourceBuilder::withCountryOfCollect);
    }

    @Test
    public void shouldNotSuggestOnIdentifier() {
        GeneticResource geneticResource = new GeneticResourceBuilder().withId("foo-bar").build();
        geneticResourceDao.saveAll(Collections.singleton(new IndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("foo")).isEmpty();
    }

    @Test
    public void shouldNotSuggestOnUrls() {
        GeneticResource geneticResource =
            new GeneticResourceBuilder().withDataURL("foo bar baz").withPortalURL("foo bar baz").build();
        geneticResourceDao.saveAll(Collections.singleton(new IndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("foo")).isEmpty();
    }

    @Test
    public void shouldSuggestOnDescription() {
        GeneticResource geneticResource =
            new GeneticResourceBuilder().withDescription("Hello world").build();
        geneticResourceDao.saveAll(Collections.singleton(new IndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("hel")).containsOnly("Hello");
        assertThat(geneticResourceDao.suggest("wor")).containsOnly("world");
    }

    @Test
    public void shouldSuggestSeveralResults() {
        GeneticResource resource =
            new GeneticResourceBuilder()
                .withId(UUID.randomUUID().toString())
                .withName("vita e bella")
                .withDatabaseSource("Florilege")
                .build();

        GeneticResource resource2 =
            new GeneticResourceBuilder()
                .withId(UUID.randomUUID().toString())
                .withTaxon(Collections.singletonList("vitis vinifera"))
                .withFamily(Collections.singletonList("vitis"))
                .withDatabaseSource("Florilege")
                .build();

        geneticResourceDao.saveAll(Arrays.asList(new IndexedGeneticResource(resource), new IndexedGeneticResource(resource2)));

        List<String> result = geneticResourceDao.suggest("vit");
        assertThat(result).containsOnly("vitis", "vita e bella");

        result = geneticResourceDao.suggest("vitis v");
        assertThat(result).containsOnly("vitis vinifera");
    }

    private void shouldSearch(BiConsumer<GeneticResourceBuilder, String> config) {
        GeneticResourceBuilder geneticResourceBuilder = new GeneticResourceBuilder();
        config.accept(geneticResourceBuilder, "foo bar baz");
        GeneticResource geneticResource = geneticResourceBuilder.build();

        geneticResourceDao.saveAll(Collections.singleton(new IndexedGeneticResource(geneticResource)));

        AggregatedPage<GeneticResource> result =
            geneticResourceDao.search("bar", false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getAggregations()).isNull();

        result = geneticResourceDao.search("bing", false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    public void shouldSearchAndAggregate() {
        GeneticResource geneticResource1 = new GeneticResourceBuilder()
            .withId("r1")
            .withName("foo")
            .withDomain("Plantae")
            .withBiotopeType(Arrays.asList("Biotope", "Human host"))
            .withMaterialType(Arrays.asList("Specimen", "DNA"))
            .withCountryOfOrigin("France")
            .withTaxon(Arrays.asList("Vitis vinifera"))
            .build();

        GeneticResource geneticResource2 = new GeneticResourceBuilder()
            .withId("r2")
            .withName("bar foo")
            .withDomain("Fungi")
            .withBiotopeType(Arrays.asList("Biotope"))
            .withMaterialType(Arrays.asList("DNA"))
            .withCountryOfOrigin("France")
            .withTaxon(Arrays.asList("Girolla mucha gusta"))
            .build();

        geneticResourceDao.saveAll(Arrays.asList(geneticResource1, geneticResource2));

        AggregatedPage<GeneticResource> result =
            geneticResourceDao.search("foo", true, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(2);

        Terms domain = result.getAggregations().get(RareAggregation.DOMAIN.getName());
        assertThat(domain.getName()).isEqualTo(RareAggregation.DOMAIN.getName());
        assertThat(domain.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Plantae", "Fungi");
        assertThat(domain.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);

        Terms biotopeType = result.getAggregations().get(RareAggregation.BIOTOPE.getName());
        assertThat(biotopeType.getName()).isEqualTo(RareAggregation.BIOTOPE.getName());
        assertThat(biotopeType.getBuckets()).extracting(Bucket::getKeyAsString).containsExactly("Biotope", "Human host");
        assertThat(biotopeType.getBuckets()).extracting(Bucket::getDocCount).containsExactly(2L, 1L);

        Terms materialType = result.getAggregations().get(RareAggregation.MATERIAL.getName());
        assertThat(materialType.getName()).isEqualTo(RareAggregation.MATERIAL.getName());
        assertThat(materialType.getBuckets()).extracting(Bucket::getKeyAsString).containsExactly("DNA", "Specimen");
        assertThat(materialType.getBuckets()).extracting(Bucket::getDocCount).containsExactly(2L, 1L);

        Terms countryOfOrigin = result.getAggregations().get(RareAggregation.COUNTRY_OF_ORIGIN.getName());
        assertThat(countryOfOrigin.getName()).isEqualTo(RareAggregation.COUNTRY_OF_ORIGIN.getName());
        assertThat(countryOfOrigin.getBuckets()).extracting(Bucket::getKeyAsString).containsExactly("France");
        assertThat(countryOfOrigin.getBuckets()).extracting(Bucket::getDocCount).containsExactly(2L);

        Terms taxon = result.getAggregations().get(RareAggregation.TAXON.getName());
        assertThat(taxon.getName()).isEqualTo(RareAggregation.TAXON.getName());
        assertThat(taxon.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Vitis vinifera", "Girolla mucha gusta");
        assertThat(taxon.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
    }

    @Nested
    class RefinementTest {
        @BeforeEach
        public void prepare() {
            GeneticResource geneticResource1 = new GeneticResourceBuilder()
                .withId("r1")
                .withName("foo")
                .withDomain("Plantae")
                .withBiotopeType(Arrays.asList("Biotope", "Human host"))
                .withMaterialType(Arrays.asList("Specimen", "DNA"))
                .withCountryOfOrigin("France")
                .withDescription("hello world")
                .build();

            GeneticResource geneticResource2 = new GeneticResourceBuilder()
                .withId("r2")
                .withName("bar foo")
                .withDomain("Fungi")
                .withBiotopeType(Arrays.asList("Biotope"))
                .withMaterialType(Arrays.asList("DNA"))
                .withCountryOfOrigin("France")
                .withDescription("hello world")
                .build();

            geneticResourceDao.saveAll(Arrays.asList(geneticResource1, geneticResource2));
        }

        @Test
        public void shouldApplyRefinementsOnSingleTermWithOr() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Plantae"))
                                 .build();

            AggregatedPage<GeneticResource> result =
                geneticResourceDao.search("hello", false, refinements, firstPage);

            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r1");

            refinements = SearchRefinements.builder()
                                           .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Fungi"))
                                           .build();
            result =
                geneticResourceDao.search("hello", false, refinements, firstPage);
            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r2");

            refinements = SearchRefinements.builder()
                                           .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting"))
                                           .build();
            result =
                geneticResourceDao.search("hello", false, refinements, firstPage);
            assertThat(result.getContent()).extracting(GeneticResource::getId).isEmpty();
        }

        @Test
        public void shouldApplyRefinementsOnMultipleTermsWithAnd() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Fungi"))
                                 .withTerm(RareAggregation.BIOTOPE, Arrays.asList("unexisting", "Biotope"))
                                 .build();

            AggregatedPage<GeneticResource> result =
                geneticResourceDao.search("hello", false, refinements, firstPage);

            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r2");

            refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Fungi"))
                                 .withTerm(RareAggregation.BIOTOPE, Arrays.asList("Human host"))
                                 .build();

            result =
                geneticResourceDao.search("hello", false, refinements, firstPage);
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        public void shouldApplyRefinementsAfterAggregating() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("Plantae"))
                                 .build();

            AggregatedPage<GeneticResource> result =
                geneticResourceDao.search("hello", true, refinements, firstPage);

            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r1");

            // aggregations are computed based on the result of the full-text-query, not based on the result
            // of the refinements
            Terms domain = result.getAggregations().get(RareAggregation.DOMAIN.getName());
            assertThat(domain.getBuckets()).hasSize(2);
            assertThat(domain.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Plantae", "Fungi");
            assertThat(domain.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);

            result = geneticResourceDao.search("Human", true, refinements, firstPage);

            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r1");

            domain = result.getAggregations().get(RareAggregation.DOMAIN.getName());
            assertThat(domain.getBuckets()).hasSize(1);
            assertThat(domain.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Plantae");
            assertThat(domain.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
        }
    }

    private void shouldSuggest(BiConsumer<GeneticResourceBuilder, String> config) {
        GeneticResourceBuilder geneticResourceBuilder = new GeneticResourceBuilder();
        config.accept(geneticResourceBuilder, "foo bar baz");
        GeneticResource geneticResource = geneticResourceBuilder.build();

        geneticResourceDao.saveAll(Collections.singleton(new IndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("FOO")).containsExactly("foo bar baz");
        assertThat(geneticResourceDao.suggest("bing")).isEmpty();
    }
}

