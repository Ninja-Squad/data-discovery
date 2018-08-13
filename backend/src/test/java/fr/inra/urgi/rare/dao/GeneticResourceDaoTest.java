package fr.inra.urgi.rare.dao;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.TreeSet;
import java.util.UUID;
import java.util.function.BiConsumer;

import fr.inra.urgi.rare.config.ElasticSearchConfig;
import fr.inra.urgi.rare.domain.GeneticResource;
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
    void shouldSearchOnName() {
        shouldSearch(GeneticResource.Builder::withName);
    }

    @Test
    void shouldSearchOnDescription() {
        shouldSearch(GeneticResource.Builder::withDescription);
    }

    @Test
    void shouldSearchOnPillarName() {
        shouldSearch(GeneticResource.Builder::withPillarName);
    }

    @Test
    void shouldSearchOnDatabaseSource() {
        shouldSearch(GeneticResource.Builder::withDatabaseSource);
    }

    @Test
    void shouldSearchOnDomain() {
        shouldSearch(GeneticResource.Builder::withDomain);
    }

    @Test
    void shouldSearchOnTaxon() {
        shouldSearch((b, s) -> b.withTaxon(Collections.singletonList(s)));
    }

    @Test
    void shouldSearchOnFamily() {
        shouldSearch((b, s) -> b.withFamily(Collections.singletonList(s)));
    }

    @Test
    void shouldSearchOnGenus() {
        shouldSearch((b, s) -> b.withGenus(Collections.singletonList(s)));
    }

    @Test
    void shouldSearchOnSpecies() {
        shouldSearch((b, s) -> b.withSpecies(Collections.singletonList(s)));
    }

    @Test
    void shouldSearchOnMaterialType() {
        shouldSearch((b, s) -> b.withMaterialType(Collections.singletonList(s)));
    }

    @Test
    void shouldSearchOnBiotopeType() {
        shouldSearch((b, s) -> b.withBiotopeType(Collections.singletonList(s)));
    }

    @Test
    void shouldSearchOnCountryOfOrigin() {
        shouldSearch(GeneticResource.Builder::withCountryOfOrigin);
    }

    @Test
    void shouldSearchOnCountryOfCollect() {
        shouldSearch(GeneticResource.Builder::withCountryOfCollect);
    }

    @Test
    void shouldNotSearchOnIdentifier() {
        GeneticResource geneticResource = GeneticResource.builder().withId("foo-bar").build();
        geneticResourceDao.save(geneticResource);

        assertThat(geneticResourceDao.search(geneticResource.getId(),
                                             false,
                                             false,
                                             SearchRefinements.EMPTY,
                                             firstPage).getContent()).isEmpty();
    }

    @Test
    void shouldNotSearchOnUrls() {
        GeneticResource geneticResource =
            GeneticResource.builder().withDataURL("foo bar baz").withPortalURL("foo bar baz").build();
        geneticResourceDao.save(geneticResource);

        assertThat(geneticResourceDao.search("bar",
                                             false,
                                             false,
                                             SearchRefinements.EMPTY,
                                             firstPage).getContent()).isEmpty();
    }

    @Test
    void shouldSuggestOnName() {
        shouldSuggest(GeneticResource.Builder::withName);
    }

    @Test
    void shouldSuggestOnPillarName() {
        shouldSuggest(GeneticResource.Builder::withPillarName);
    }

    @Test
    void shouldSuggestOnDatabaseSource() {
        shouldSuggest(GeneticResource.Builder::withDatabaseSource);
    }

    @Test
    void shouldSuggestOnDomain() {
        shouldSuggest(GeneticResource.Builder::withDomain);
    }

    @Test
    void shouldSuggestOnTaxon() {
        shouldSuggest((b, s) -> b.withTaxon(Collections.singletonList(s)));
    }

    @Test
    void shouldSuggestOnFamily() {
        shouldSuggest((b, s) -> b.withFamily(Collections.singletonList(s)));
    }

    @Test
    void shouldSuggestOnGenus() {
        shouldSuggest((b, s) -> b.withGenus(Collections.singletonList(s)));
    }

    @Test
    void shouldSuggestOnSpecies() {
        shouldSuggest((b, s) -> b.withSpecies(Collections.singletonList(s)));
    }

    @Test
    void shouldSuggestOnMaterialType() {
        shouldSuggest((b, s) -> b.withMaterialType(Collections.singletonList(s)));
    }

    @Test
    void shouldSuggestOnBiotopeType() {
        shouldSuggest((b, s) -> b.withBiotopeType(Collections.singletonList(s)));
    }

    @Test
    void shouldSuggestOnCountryOfOrigin() {
        shouldSuggest(GeneticResource.Builder::withCountryOfOrigin);
    }

    @Test
    void shouldSuggestOnCountryOfCollect() {
        shouldSuggest(GeneticResource.Builder::withCountryOfCollect);
    }

    @Test
    void shouldNotSuggestOnIdentifier() {
        GeneticResource geneticResource = GeneticResource.builder().withId("foo-bar").build();
        geneticResourceDao.saveAll(Collections.singleton(new IndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("foo")).isEmpty();
    }

    @Test
    void shouldNotSuggestOnUrls() {
        GeneticResource geneticResource =
            GeneticResource.builder().withDataURL("foo bar baz").withPortalURL("foo bar baz").build();
        geneticResourceDao.saveAll(Collections.singleton(new IndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("foo")).isEmpty();
    }

    @Test
    void shouldSuggestOnDescription() {
        GeneticResource geneticResource =
            GeneticResource.builder().withDescription("Hello world").build();
        geneticResourceDao.saveAll(Collections.singleton(new IndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("hel")).containsOnly("Hello");
        assertThat(geneticResourceDao.suggest("wor")).containsOnly("world");
    }

    @Test
    void shouldSuggestSeveralResults() {
        GeneticResource resource =
            GeneticResource.builder()
                .withId(UUID.randomUUID().toString())
                .withName("vita e bella")
                .withDatabaseSource("Florilege")
                .build();

        GeneticResource resource2 =
            GeneticResource.builder()
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

    @Test
    void shouldRemoveCaseDifferingResults() {
        GeneticResource resource =
            GeneticResource.builder()
                .withId(UUID.randomUUID().toString())
                .withName("vita")
                .build();

        GeneticResource resource2 =
            GeneticResource.builder()
                .withId(UUID.randomUUID().toString())
                .withName("vitis")
                .build();

        GeneticResource resource3 =
            GeneticResource.builder()
                .withId(UUID.randomUUID().toString())
                .withName("VITIS")
                .build();

        geneticResourceDao.saveAll(Arrays.asList(new IndexedGeneticResource(resource),
                                                 new IndexedGeneticResource(resource2),
                                                 new IndexedGeneticResource(resource3)));

        List<String> result = geneticResourceDao.suggest("vit");
        assertThat(result).hasSize(2);

        TreeSet<String> ignoringCaseSet = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        ignoringCaseSet.addAll(result);
        assertThat(ignoringCaseSet).hasSize(2);
    }

    @Test
    void shouldNotFailSuggestingIfNoData() {
        assertThat(geneticResourceDao.suggest("vitis")).isEmpty();
    }

    private void shouldSearch(BiConsumer<GeneticResource.Builder, String> config) {
        GeneticResource.Builder geneticResourceBuilder = GeneticResource.builder();
        config.accept(geneticResourceBuilder, "foo bar baz");
        GeneticResource geneticResource = geneticResourceBuilder.build();

        geneticResourceDao.saveAll(Collections.singleton(new IndexedGeneticResource(geneticResource)));

        AggregatedPage<GeneticResource> result =
            geneticResourceDao.search("bar", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getAggregations()).isNull();

        result = geneticResourceDao.search("bing", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void shouldSearchAndAggregate() {
        GeneticResource geneticResource1 = GeneticResource.builder()
            .withId("r1")
            .withName("foo")
            .withDomain("Plantae")
            .withBiotopeType(Arrays.asList("Biotope", "Human host"))
            .withMaterialType(Arrays.asList("Specimen", "DNA"))
            .withCountryOfOrigin("France")
            .withTaxon(Arrays.asList("Vitis vinifera"))
            .build();

        GeneticResource geneticResource2 = GeneticResource.builder()
            .withId("r2")
            .withName("bar foo")
            .withDomain("Fungi")
            .withBiotopeType(Arrays.asList("Biotope"))
            .withMaterialType(Arrays.asList("DNA"))
            .withCountryOfOrigin("France")
            .withTaxon(Arrays.asList("Girolla mucha gusta"))
            .build();

        geneticResourceDao.saveAll(Arrays.asList(new IndexedGeneticResource(geneticResource1),
                                                 new IndexedGeneticResource(geneticResource2)));

        AggregatedPage<GeneticResource> result =
            geneticResourceDao.search("foo", true, false, SearchRefinements.EMPTY, firstPage);
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

    @Test
    void shouldAggregateNullCountryOfOriginValueAsNullValue() {
        GeneticResource geneticResource1 = GeneticResource.builder()
                                                          .withId("r1")
                                                          .withName("vitis 1")
                                                          .withCountryOfOrigin("France")
                                                          .build();

        GeneticResource geneticResource2 = GeneticResource.builder()
                                                          .withId("r2")
                                                          .withName("vitis 2")
                                                          .withCountryOfOrigin(null)
                                                          .build();

        geneticResourceDao.saveAll(Arrays.asList(new IndexedGeneticResource(geneticResource1),
                                                 new IndexedGeneticResource(geneticResource2)));

        AggregatedPage<GeneticResource> result =
            geneticResourceDao.search("vitis", true, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(2);

        Terms countryOfOrigin = result.getAggregations().get(RareAggregation.COUNTRY_OF_ORIGIN.getName());
        assertThat(countryOfOrigin.getName()).isEqualTo(RareAggregation.COUNTRY_OF_ORIGIN.getName());
        assertThat(countryOfOrigin.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("France", GeneticResource.NULL_VALUE);
        assertThat(countryOfOrigin.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
    }

    @Test
    void shouldAggregateEmptyMaterialTypeAsNullValue() {
        shouldAggregateEmptyArrayAsNullValue(RareAggregation.MATERIAL,
                                             (builder, value) -> builder.withMaterialType(value));
    }

    @Test
    void shouldAggregateEmptyBiotopeTypeAsNullValue() {
        shouldAggregateEmptyArrayAsNullValue(RareAggregation.BIOTOPE,
                                             (builder, value) -> builder.withBiotopeType(value));
    }

    private void shouldAggregateEmptyArrayAsNullValue(RareAggregation rareAggregation,
                                                      BiConsumer<GeneticResource.Builder, List<String>> initializer) {
        GeneticResource.Builder resource1Builder = GeneticResource.builder()
                                                    .withId("r1")
                                                    .withName("vitis 1");
        initializer.accept(resource1Builder, Collections.singletonList("foo"));
        GeneticResource geneticResource1 = resource1Builder.build();

        GeneticResource geneticResource2 = GeneticResource.builder()
                                                          .withId("r2")
                                                          .withName("vitis 2")
                                                          .build();

        geneticResourceDao.saveAll(Arrays.asList(new IndexedGeneticResource(geneticResource1),
                                                 new IndexedGeneticResource(geneticResource2)));

        AggregatedPage<GeneticResource> result =
            geneticResourceDao.search("vitis", true, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(2);

        Terms material = result.getAggregations().get(rareAggregation.getName());
        assertThat(material.getName()).isEqualTo(rareAggregation.getName());
        assertThat(material.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("foo", GeneticResource.NULL_VALUE);
        assertThat(material.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
    }

    @Test
    void shouldFindPillars() {
        GeneticResource resource1 = GeneticResource.builder()
            .withId("r1")
            .withPillarName("P1")
            .withDatabaseSource("D11")
            .withPortalURL("D11Url")
            .build();

        GeneticResource resource2 = GeneticResource.builder()
            .withId("r2")
            .withPillarName("P1")
            .withDatabaseSource("D11")
            .withPortalURL("D11Url")
            .build();

        GeneticResource resource3 = GeneticResource.builder()
            .withId("r3")
            .withPillarName("P1")
            .withDatabaseSource("D12")
            .withPortalURL("D12Url")
            .build();

        GeneticResource resource4 = GeneticResource.builder()
            .withId("r4")
            .withPillarName("P2")
            .withDatabaseSource("D21")
            .withPortalURL("D21Url")
            .build();

        GeneticResource resource5 = GeneticResource.builder()
            .withId("r5")
            .withPillarName("P2")
            .withDatabaseSource("D22")
            .build();

        geneticResourceDao.saveAll(Arrays.asList(
            new IndexedGeneticResource(resource1),
            new IndexedGeneticResource(resource2),
            new IndexedGeneticResource(resource3),
            new IndexedGeneticResource(resource4),
            new IndexedGeneticResource(resource5)));

        Terms pillars = geneticResourceDao.findPillars();

        assertThat(pillars.getBuckets()).hasSize(2);

        Bucket p1 = pillars.getBucketByKey("P1");

        Terms databaseSource = p1.getAggregations().get(GeneticResourceDao.DATABASE_SOURCE_AGGREGATION_NAME);
        assertThat(databaseSource.getBuckets()).hasSize(2);

        Bucket d11 = databaseSource.getBucketByKey("D11");
        assertThat(d11.getDocCount()).isEqualTo(2);
        Terms d11Url = d11.getAggregations().get(GeneticResourceDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d11Url.getBuckets()).hasSize(1);
        assertThat(d11Url.getBuckets().get(0).getKeyAsString()).isEqualTo("D11Url");

        Bucket d12 = databaseSource.getBucketByKey("D12");
        assertThat(d12.getDocCount()).isEqualTo(1);
        Terms d12Url = d12.getAggregations().get(GeneticResourceDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d12Url.getBuckets()).hasSize(1);
        assertThat(d12Url.getBuckets().get(0).getKeyAsString()).isEqualTo("D12Url");

        Bucket p2 = pillars.getBucketByKey("P2");

        databaseSource = p2.getAggregations().get(GeneticResourceDao.DATABASE_SOURCE_AGGREGATION_NAME);
        assertThat(databaseSource.getBuckets()).hasSize(2);

        Bucket d21 = databaseSource.getBucketByKey("D21");
        assertThat(d21.getDocCount()).isEqualTo(1);
        Terms d21Url = d21.getAggregations().get(GeneticResourceDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d21Url.getBuckets()).hasSize(1);
        assertThat(d21Url.getBuckets().get(0).getKeyAsString()).isEqualTo("D21Url");

        Bucket d22 = databaseSource.getBucketByKey("D22");
        assertThat(d22.getDocCount()).isEqualTo(1);
        Terms d22Url = d22.getAggregations().get(GeneticResourceDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d22Url.getBuckets()).isEmpty();
    }

    @Test
    void shouldHighlightDescription() {
        GeneticResource resource1 =
            GeneticResource.builder()
                           .withId("r1")
                           .withDescription("Here comes the sun, tadadada. It's alright.")
                           .build();


        GeneticResource resource2 =
            GeneticResource.builder()
                           .withId("r2")
                           .withName("The sun.")
                           .withDescription("Imagine all the people")
                           .build();

        geneticResourceDao.saveAll(Arrays.asList(new IndexedGeneticResource(resource1),
                                                 new IndexedGeneticResource(resource2)));

        AggregatedPage<GeneticResource> result = geneticResourceDao.search("comes sun",
                                                                              false,
                                                                              true,
                                                                              SearchRefinements.EMPTY,
                                                                              firstPage);

        assertThat(result.getContent())
            .extracting(GeneticResource::getDescription)
            .containsOnly("Here <em>comes</em> the <em>sun</em>, tadadada. It's alright.", "Imagine all the people");
    }

    @Nested
    class RefinementTest {
        @BeforeEach
        void prepare() {
            GeneticResource geneticResource1 = GeneticResource.builder()
                .withId("r1")
                .withName("foo")
                .withDomain("Plantae")
                .withBiotopeType(Arrays.asList("Biotope", "Human host"))
                .withMaterialType(Arrays.asList("Specimen", "DNA"))
                .withCountryOfOrigin("France")
                .withDescription("hello world")
                .build();

            GeneticResource geneticResource2 = GeneticResource.builder()
                .withId("r2")
                .withName("bar foo")
                .withDomain("Fungi")
                .withBiotopeType(Arrays.asList("Biotope"))
                .withMaterialType(Arrays.asList("DNA"))
                .withCountryOfOrigin(null)
                .withDescription("hello world")
                .build();

            GeneticResource geneticResource3 = GeneticResource.builder()
                .withId("r3")
                .withName("ding")
                .withDomain("Plantae")
                .withBiotopeType(Collections.emptyList())
                .withMaterialType(Collections.emptyList())
                .withCountryOfOrigin("France")
                .withDescription("hello world")
                .build();

            geneticResourceDao.saveAll(Arrays.asList(new IndexedGeneticResource(geneticResource1),
                                                     new IndexedGeneticResource(geneticResource2),
                                                     new IndexedGeneticResource(geneticResource3)));
        }

        @Test
        void shouldApplyRefinementsOnSingleTermWithOr() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Plantae"))
                                 .build();

            AggregatedPage<GeneticResource> result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r1", "r3");

            refinements = SearchRefinements.builder()
                                           .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Fungi"))
                                           .build();
            result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);
            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r2");

            refinements = SearchRefinements.builder()
                                           .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting"))
                                           .build();
            result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);
            assertThat(result.getContent()).extracting(GeneticResource::getId).isEmpty();
        }

        @Test
        void shouldApplyRefinementOnNullValue() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.COUNTRY_OF_ORIGIN, Arrays.asList(GeneticResource.NULL_VALUE))
                                 .build();

            AggregatedPage<GeneticResource> result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r2");
        }

        @Test
        void shouldApplyRefinementOnEmptyBiotopeType() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.BIOTOPE, Arrays.asList(GeneticResource.NULL_VALUE))
                                 .build();

            AggregatedPage<GeneticResource> result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r3");
        }

        @Test
        void shouldApplyRefinementOnEmptyMaterialType() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.MATERIAL, Arrays.asList(GeneticResource.NULL_VALUE))
                                 .build();

            AggregatedPage<GeneticResource> result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r3");
        }

        @Test
        void shouldApplyRefinementsOnMultipleTermsWithAnd() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Fungi"))
                                 .withTerm(RareAggregation.BIOTOPE, Arrays.asList("unexisting", "Biotope"))
                                 .build();

            AggregatedPage<GeneticResource> result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r2");

            refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Fungi"))
                                 .withTerm(RareAggregation.BIOTOPE, Arrays.asList("Human host"))
                                 .build();

            result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        void shouldApplyRefinementsAfterAggregating() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("Plantae"))
                                 .build();

            AggregatedPage<GeneticResource> result =
                geneticResourceDao.search("hello", true, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r1", "r3");

            // aggregations are computed based on the result of the full-text-query, not based on the result
            // of the refinements
            Terms domain = result.getAggregations().get(RareAggregation.DOMAIN.getName());
            assertThat(domain.getBuckets()).hasSize(2);
            assertThat(domain.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Plantae", "Fungi");
            assertThat(domain.getBuckets()).extracting(Bucket::getDocCount).containsOnly(2L, 1L);

            result = geneticResourceDao.search("Human", true, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(GeneticResource::getId).containsOnly("r1");

            domain = result.getAggregations().get(RareAggregation.DOMAIN.getName());
            assertThat(domain.getBuckets()).hasSize(1);
            assertThat(domain.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Plantae");
            assertThat(domain.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
        }
    }

    private void shouldSuggest(BiConsumer<GeneticResource.Builder, String> config) {
        GeneticResource.Builder geneticResourceBuilder = GeneticResource.builder();
        config.accept(geneticResourceBuilder, "foo bar baz");
        GeneticResource geneticResource = geneticResourceBuilder.build();

        geneticResourceDao.saveAll(Collections.singleton(new IndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("FOO")).containsExactly("foo bar baz");
        assertThat(geneticResourceDao.suggest("bing")).isEmpty();
    }
}

