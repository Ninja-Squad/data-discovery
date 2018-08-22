package fr.inra.urgi.rare.dao.rare;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.TreeSet;
import java.util.UUID;
import java.util.function.BiConsumer;

import fr.inra.urgi.rare.config.AppProfile;
import fr.inra.urgi.rare.config.ElasticSearchConfig;
import fr.inra.urgi.rare.dao.SearchRefinements;
import fr.inra.urgi.rare.domain.Location;
import fr.inra.urgi.rare.domain.rare.RareGeneticResource;
import fr.inra.urgi.rare.domain.rare.RareIndexedGeneticResource;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms.Bucket;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;
import org.springframework.data.elasticsearch.core.mapping.ElasticsearchPersistentEntity;
import org.springframework.data.elasticsearch.core.query.AliasBuilder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@TestPropertySource("/test.properties")
@Import(ElasticSearchConfig.class)
@JsonTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles(AppProfile.RARE)
class RareGeneticResourceDaoTest {

    private static final String PHYSICAL_INDEX = "test-rare-resource-physical-index";

    @Autowired
    private RareGeneticResourceDao geneticResourceDao;

    @Autowired
    private ElasticsearchTemplate elasticsearchTemplate;

    private Pageable firstPage = PageRequest.of(0, 10);

    @BeforeAll
    void prepareIndex() {
        ElasticsearchPersistentEntity indexedGeneticResourceEntity = elasticsearchTemplate.getPersistentEntityFor(
            RareIndexedGeneticResource.class);
        ElasticsearchPersistentEntity geneticResourceEntity = elasticsearchTemplate.getPersistentEntityFor(
            RareGeneticResource.class);
        elasticsearchTemplate.deleteIndex(PHYSICAL_INDEX);
        elasticsearchTemplate.createIndex(PHYSICAL_INDEX);
        elasticsearchTemplate.addAlias(
            new AliasBuilder().withAliasName(indexedGeneticResourceEntity.getIndexName())
                              .withIndexName(PHYSICAL_INDEX)
                              .build()
        );
        elasticsearchTemplate.addAlias(
            new AliasBuilder().withAliasName(geneticResourceEntity.getIndexName())
                              .withIndexName(PHYSICAL_INDEX)
                              .build()
        );
        elasticsearchTemplate.putMapping(RareIndexedGeneticResource.class);
    }

    @BeforeEach
    void prepare() {
        geneticResourceDao.deleteAll();
    }

    @Test
    void shouldSaveAndGet() {

        RareGeneticResource geneticResource =
            RareGeneticResource.builder()
                               .withId("doi:10.15454/1.492178535151698E12")
                               .withName("Grecanico dorato")
                               .withDescription("Grecanico dorato is a Vitis vinifera subsp vinifera cv. Garganega accession (number: "
                                + "1310Mtp1, doi:10.15454/1.492178535151698E12) maintained by the GRAPEVINE (managed by INRA) and held "
                                + "by INRA. It is a maintained/maintenu accession of biological status traditional cultivar/cultivar "
                                + "traditionnel")
                               .withPillarName("Plant")
                               .withDatabaseSource("Florilège")
                               .withPortalURL("http://florilege.arcad-project.org/fr/collections")
                               .withDataURL("https://urgi.versailles.inra.fr/gnpis-core/#accessionCard/id=ZG9pOjEwLjE1NDU0LzEuNDkyMTc4NTM1MTUxNjk4RTEy")
                               .withDomain("Plantae")
                               .withTaxon(Collections.singletonList("Vitis vinifera"))
                               .withFamily(Collections.singletonList("Vitaceae"))
                               .withGenus(Collections.singletonList("Vitis"))
                               .withSpecies(Collections.singletonList("Vitis vinifera"))
                               .withMaterialType(Collections.singletonList("testMaterialType"))
                               .withBiotopeType(Collections.singletonList("testBiotopeType"))
                               .withCountryOfOrigin("France")
                               .withLocationOfOrigin(new Location(0.1, 0.2))
                               .withCountryOfCollect("Italy")
                               .withLocationOfCollect(new Location(37.5,15.099722))
                               .build();

        geneticResourceDao.saveAll(Collections.singleton(new RareIndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.findById(geneticResource.getId()).get()).isEqualTo(geneticResource);
    }

    @Test
    void shouldSearchOnName() {
        shouldSearch(RareGeneticResource.Builder::withName);
    }

    @Test
    void shouldSearchOnDescription() {
        shouldSearch(RareGeneticResource.Builder::withDescription);
    }

    @Test
    void shouldSearchOnPillarName() {
        shouldSearch(RareGeneticResource.Builder::withPillarName);
    }

    @Test
    void shouldSearchOnDatabaseSource() {
        shouldSearch(RareGeneticResource.Builder::withDatabaseSource);
    }

    @Test
    void shouldSearchOnDomain() {
        shouldSearch(RareGeneticResource.Builder::withDomain);
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
        shouldSearch(RareGeneticResource.Builder::withCountryOfOrigin);
    }

    @Test
    void shouldSearchOnCountryOfCollect() {
        shouldSearch(RareGeneticResource.Builder::withCountryOfCollect);
    }

    @Test
    void shouldNotSearchOnIdentifier() {
        RareGeneticResource geneticResource = RareGeneticResource.builder().withId("foo-bar").build();
        geneticResourceDao.save(geneticResource);

        assertThat(geneticResourceDao.search(geneticResource.getId(),
                                             false,
                                             false,
                                             SearchRefinements.EMPTY,
                                             firstPage).getContent()).isEmpty();
    }

    @Test
    void shouldNotSearchOnUrls() {
        RareGeneticResource geneticResource =
            RareGeneticResource.builder().withDataURL("foo bar baz").withPortalURL("foo bar baz").build();
        geneticResourceDao.save(geneticResource);

        assertThat(geneticResourceDao.search("bar",
                                             false,
                                             false,
                                             SearchRefinements.EMPTY,
                                             firstPage).getContent()).isEmpty();
    }

    @Test
    void shouldSuggestOnName() {
        shouldSuggest(RareGeneticResource.Builder::withName);
    }

    @Test
    void shouldSuggestOnPillarName() {
        shouldSuggest(RareGeneticResource.Builder::withPillarName);
    }

    @Test
    void shouldSuggestOnDatabaseSource() {
        shouldSuggest(RareGeneticResource.Builder::withDatabaseSource);
    }

    @Test
    void shouldSuggestOnDomain() {
        shouldSuggest(RareGeneticResource.Builder::withDomain);
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
        shouldSuggest(RareGeneticResource.Builder::withCountryOfOrigin);
    }

    @Test
    void shouldSuggestOnCountryOfCollect() {
        shouldSuggest(RareGeneticResource.Builder::withCountryOfCollect);
    }

    @Test
    void shouldNotSuggestOnIdentifier() {
        RareGeneticResource geneticResource = RareGeneticResource.builder().withId("foo-bar").build();
        geneticResourceDao.saveAll(Collections.singleton(new RareIndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("foo")).isEmpty();
    }

    @Test
    void shouldNotSuggestOnUrls() {
        RareGeneticResource geneticResource =
            RareGeneticResource.builder().withDataURL("foo bar baz").withPortalURL("foo bar baz").build();
        geneticResourceDao.saveAll(Collections.singleton(new RareIndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("foo")).isEmpty();
    }

    @Test
    void shouldSuggestOnDescription() {
        RareGeneticResource geneticResource =
            RareGeneticResource.builder().withDescription("Hello world").build();
        geneticResourceDao.saveAll(Collections.singleton(new RareIndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("hel")).containsOnly("Hello");
        assertThat(geneticResourceDao.suggest("wor")).containsOnly("world");
    }

    @Test
    void shouldSuggestSeveralResults() {
        RareGeneticResource resource =
            RareGeneticResource.builder()
                               .withId(UUID.randomUUID().toString())
                               .withName("vita e bella")
                               .withDatabaseSource("Florilege")
                               .build();

        RareGeneticResource resource2 =
            RareGeneticResource.builder()
                               .withId(UUID.randomUUID().toString())
                               .withTaxon(Collections.singletonList("vitis vinifera"))
                               .withFamily(Collections.singletonList("vitis"))
                               .withDatabaseSource("Florilege")
                               .build();

        geneticResourceDao.saveAll(Arrays.asList(new RareIndexedGeneticResource(resource), new RareIndexedGeneticResource(resource2)));

        List<String> result = geneticResourceDao.suggest("vit");
        assertThat(result).containsOnly("vitis", "vita e bella");

        result = geneticResourceDao.suggest("vitis v");
        assertThat(result).containsOnly("vitis vinifera");
    }

    @Test
    void shouldRemoveCaseDifferingResults() {
        RareGeneticResource resource =
            RareGeneticResource.builder()
                               .withId(UUID.randomUUID().toString())
                               .withName("vita")
                               .build();

        RareGeneticResource resource2 =
            RareGeneticResource.builder()
                               .withId(UUID.randomUUID().toString())
                               .withName("vitis")
                               .build();

        RareGeneticResource resource3 =
            RareGeneticResource.builder()
                               .withId(UUID.randomUUID().toString())
                               .withName("VITIS")
                               .build();

        geneticResourceDao.saveAll(Arrays.asList(new RareIndexedGeneticResource(resource),
                                                 new RareIndexedGeneticResource(resource2),
                                                 new RareIndexedGeneticResource(resource3)));

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

    private void shouldSearch(BiConsumer<RareGeneticResource.Builder, String> config) {
        RareGeneticResource.Builder geneticResourceBuilder = RareGeneticResource.builder();
        config.accept(geneticResourceBuilder, "foo bar baz");
        RareGeneticResource geneticResource = geneticResourceBuilder.build();

        geneticResourceDao.saveAll(Collections.singleton(new RareIndexedGeneticResource(geneticResource)));

        AggregatedPage<RareGeneticResource> result =
            geneticResourceDao.search("bar", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getAggregations()).isNull();

        result = geneticResourceDao.search("bing", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void shouldSearchAndAggregate() {
        RareGeneticResource geneticResource1 = RareGeneticResource.builder()
                                                                  .withId("r1")
                                                                  .withName("foo")
                                                                  .withDomain("Plantae")
                                                                  .withBiotopeType(Arrays.asList("Biotope", "Human host"))
                                                                  .withMaterialType(Arrays.asList("Specimen", "DNA"))
                                                                  .withCountryOfOrigin("France")
                                                                  .withCountryOfCollect("Belgium")
                                                                  .withTaxon(Arrays.asList("Vitis vinifera"))
                                                                  .build();

        RareGeneticResource geneticResource2 = RareGeneticResource.builder()
                                                                  .withId("r2")
                                                                  .withName("bar foo")
                                                                  .withDomain("Fungi")
                                                                  .withBiotopeType(Arrays.asList("Biotope"))
                                                                  .withMaterialType(Arrays.asList("DNA"))
                                                                  .withCountryOfOrigin("France")
                                                                  .withCountryOfCollect("Belgium")
                                                                  .withTaxon(Arrays.asList("Girolla mucha gusta"))
                                                                  .build();

        geneticResourceDao.saveAll(Arrays.asList(new RareIndexedGeneticResource(geneticResource1),
                                                 new RareIndexedGeneticResource(geneticResource2)));

        AggregatedPage<RareGeneticResource> result =
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

        Terms countryOfCollect = result.getAggregations().get(RareAggregation.COUNTRY_OF_COLLECT.getName());
        assertThat(countryOfCollect.getName()).isEqualTo(RareAggregation.COUNTRY_OF_COLLECT.getName());
        assertThat(countryOfCollect.getBuckets()).extracting(Bucket::getKeyAsString).containsExactly("Belgium");
        assertThat(countryOfCollect.getBuckets()).extracting(Bucket::getDocCount).containsExactly(2L);

        Terms taxon = result.getAggregations().get(RareAggregation.TAXON.getName());
        assertThat(taxon.getName()).isEqualTo(RareAggregation.TAXON.getName());
        assertThat(taxon.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Vitis vinifera", "Girolla mucha gusta");
        assertThat(taxon.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
    }

    @Test
    void shouldAggregateNullCountryOfOriginValueAsNullValue() {
        shouldAggregateNullValue(RareAggregation.COUNTRY_OF_ORIGIN, RareGeneticResource.Builder::withCountryOfOrigin);
    }

    @Test
    void shouldAggregateNullCountryOfCollectValueAsNullValue() {
        shouldAggregateNullValue(RareAggregation.COUNTRY_OF_COLLECT, RareGeneticResource.Builder::withCountryOfCollect);
    }

    @Test
    void shouldAggregateEmptyMaterialTypeAsNullValue() {
        shouldAggregateEmptyArrayAsNullValue(RareAggregation.MATERIAL,
                                             RareGeneticResource.Builder::withMaterialType);
    }

    @Test
    void shouldAggregateEmptyBiotopeTypeAsNullValue() {
        shouldAggregateEmptyArrayAsNullValue(RareAggregation.BIOTOPE,
                                             RareGeneticResource.Builder::withBiotopeType);
    }

    private void shouldAggregateNullValue(RareAggregation rareAggregation,
                                          BiConsumer<RareGeneticResource.Builder, String> initializer) {
        RareGeneticResource.Builder resource1Builder = RareGeneticResource.builder()
                                                                          .withId("r1")
                                                                          .withName("vitis 1");
        initializer.accept(resource1Builder, "foo");
        RareGeneticResource geneticResource1 = resource1Builder.build();

        RareGeneticResource geneticResource2 = RareGeneticResource.builder()
                                                                  .withId("r2")
                                                                  .withName("vitis 2")
                                                                  .build();

        geneticResourceDao.saveAll(Arrays.asList(new RareIndexedGeneticResource(geneticResource1),
                                                 new RareIndexedGeneticResource(geneticResource2)));

        AggregatedPage<RareGeneticResource> result =
            geneticResourceDao.search("vitis", true, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(2);

        Terms material = result.getAggregations().get(rareAggregation.getName());
        assertThat(material.getName()).isEqualTo(rareAggregation.getName());
        assertThat(material.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("foo", RareGeneticResource.NULL_VALUE);
        assertThat(material.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
    }

    private void shouldAggregateEmptyArrayAsNullValue(RareAggregation rareAggregation,
                                                      BiConsumer<RareGeneticResource.Builder, List<String>> initializer) {
        RareGeneticResource.Builder resource1Builder = RareGeneticResource.builder()
                                                                          .withId("r1")
                                                                          .withName("vitis 1");
        initializer.accept(resource1Builder, Collections.singletonList("foo"));
        RareGeneticResource geneticResource1 = resource1Builder.build();

        RareGeneticResource geneticResource2 = RareGeneticResource.builder()
                                                                  .withId("r2")
                                                                  .withName("vitis 2")
                                                                  .build();

        geneticResourceDao.saveAll(Arrays.asList(new RareIndexedGeneticResource(geneticResource1),
                                                 new RareIndexedGeneticResource(geneticResource2)));

        AggregatedPage<RareGeneticResource> result =
            geneticResourceDao.search("vitis", true, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(2);

        Terms material = result.getAggregations().get(rareAggregation.getName());
        assertThat(material.getName()).isEqualTo(rareAggregation.getName());
        assertThat(material.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("foo", RareGeneticResource.NULL_VALUE);
        assertThat(material.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
    }

    @Test
    void shouldFindPillars() {
        RareGeneticResource resource1 = RareGeneticResource.builder()
                                                           .withId("r1")
                                                           .withPillarName("P1")
                                                           .withDatabaseSource("D11")
                                                           .withPortalURL("D11Url")
                                                           .build();

        RareGeneticResource resource2 = RareGeneticResource.builder()
                                                           .withId("r2")
                                                           .withPillarName("P1")
                                                           .withDatabaseSource("D11")
                                                           .withPortalURL("D11Url")
                                                           .build();

        RareGeneticResource resource3 = RareGeneticResource.builder()
                                                           .withId("r3")
                                                           .withPillarName("P1")
                                                           .withDatabaseSource("D12")
                                                           .withPortalURL("D12Url")
                                                           .build();

        RareGeneticResource resource4 = RareGeneticResource.builder()
                                                           .withId("r4")
                                                           .withPillarName("P2")
                                                           .withDatabaseSource("D21")
                                                           .withPortalURL("D21Url")
                                                           .build();

        RareGeneticResource resource5 = RareGeneticResource.builder()
                                                           .withId("r5")
                                                           .withPillarName("P2")
                                                           .withDatabaseSource("D22")
                                                           .build();

        geneticResourceDao.saveAll(Arrays.asList(
            new RareIndexedGeneticResource(resource1),
            new RareIndexedGeneticResource(resource2),
            new RareIndexedGeneticResource(resource3),
            new RareIndexedGeneticResource(resource4),
            new RareIndexedGeneticResource(resource5)));

        Terms pillars = geneticResourceDao.findPillars();

        assertThat(pillars.getBuckets()).hasSize(2);

        Bucket p1 = pillars.getBucketByKey("P1");

        Terms databaseSource = p1.getAggregations().get(RareGeneticResourceDao.DATABASE_SOURCE_AGGREGATION_NAME);
        assertThat(databaseSource.getBuckets()).hasSize(2);

        Bucket d11 = databaseSource.getBucketByKey("D11");
        assertThat(d11.getDocCount()).isEqualTo(2);
        Terms d11Url = d11.getAggregations().get(RareGeneticResourceDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d11Url.getBuckets()).hasSize(1);
        assertThat(d11Url.getBuckets().get(0).getKeyAsString()).isEqualTo("D11Url");

        Bucket d12 = databaseSource.getBucketByKey("D12");
        assertThat(d12.getDocCount()).isEqualTo(1);
        Terms d12Url = d12.getAggregations().get(RareGeneticResourceDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d12Url.getBuckets()).hasSize(1);
        assertThat(d12Url.getBuckets().get(0).getKeyAsString()).isEqualTo("D12Url");

        Bucket p2 = pillars.getBucketByKey("P2");

        databaseSource = p2.getAggregations().get(RareGeneticResourceDao.DATABASE_SOURCE_AGGREGATION_NAME);
        assertThat(databaseSource.getBuckets()).hasSize(2);

        Bucket d21 = databaseSource.getBucketByKey("D21");
        assertThat(d21.getDocCount()).isEqualTo(1);
        Terms d21Url = d21.getAggregations().get(RareGeneticResourceDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d21Url.getBuckets()).hasSize(1);
        assertThat(d21Url.getBuckets().get(0).getKeyAsString()).isEqualTo("D21Url");

        Bucket d22 = databaseSource.getBucketByKey("D22");
        assertThat(d22.getDocCount()).isEqualTo(1);
        Terms d22Url = d22.getAggregations().get(RareGeneticResourceDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d22Url.getBuckets()).isEmpty();
    }

    @Test
    void shouldHighlightDescription() {
        RareGeneticResource resource1 =
            RareGeneticResource.builder()
                               .withId("r1")
                               .withDescription("Here comes the sun, tadadada. It's alright.")
                               .build();


        RareGeneticResource resource2 =
            RareGeneticResource.builder()
                               .withId("r2")
                               .withName("The sun.")
                               .withDescription("Imagine all the people")
                               .build();

        geneticResourceDao.saveAll(Arrays.asList(new RareIndexedGeneticResource(resource1),
                                                 new RareIndexedGeneticResource(resource2)));

        AggregatedPage<RareGeneticResource> result = geneticResourceDao.search("comes sun",
                                                                               false,
                                                                               true,
                                                                               SearchRefinements.EMPTY,
                                                                               firstPage);

        assertThat(result.getContent())
            .extracting(RareGeneticResource::getDescription)
            .containsOnly("Here <em>comes</em> the <em>sun</em>, tadadada. It's alright.", "Imagine all the people");
    }

    @Nested
    class RefinementTest {
        @BeforeEach
        void prepare() {
            RareGeneticResource geneticResource1 = RareGeneticResource.builder()
                                                                      .withId("r1")
                                                                      .withName("foo")
                                                                      .withDomain("Plantae")
                                                                      .withBiotopeType(Arrays.asList("Biotope", "Human host"))
                                                                      .withMaterialType(Arrays.asList("Specimen", "DNA"))
                                                                      .withCountryOfOrigin("France")
                                                                      .withDescription("hello world")
                                                                      .build();

            RareGeneticResource geneticResource2 = RareGeneticResource.builder()
                                                                      .withId("r2")
                                                                      .withName("bar foo")
                                                                      .withDomain("Fungi")
                                                                      .withBiotopeType(Arrays.asList("Biotope"))
                                                                      .withMaterialType(Arrays.asList("DNA"))
                                                                      .withCountryOfOrigin(null)
                                                                      .withDescription("hello world")
                                                                      .build();

            RareGeneticResource geneticResource3 = RareGeneticResource.builder()
                                                                      .withId("r3")
                                                                      .withName("ding")
                                                                      .withDomain("Plantae")
                                                                      .withBiotopeType(Collections.emptyList())
                                                                      .withMaterialType(Collections.emptyList())
                                                                      .withCountryOfOrigin("France")
                                                                      .withDescription("hello world")
                                                                      .build();

            geneticResourceDao.saveAll(Arrays.asList(new RareIndexedGeneticResource(geneticResource1),
                                                     new RareIndexedGeneticResource(geneticResource2),
                                                     new RareIndexedGeneticResource(geneticResource3)));
        }

        @Test
        void shouldApplyRefinementsOnSingleTermWithOr() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Plantae"))
                                 .build();

            AggregatedPage<RareGeneticResource> result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(RareGeneticResource::getId).containsOnly("r1", "r3");

            refinements = SearchRefinements.builder()
                                           .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Fungi"))
                                           .build();
            result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);
            assertThat(result.getContent()).extracting(RareGeneticResource::getId).containsOnly("r2");

            refinements = SearchRefinements.builder()
                                           .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting"))
                                           .build();
            result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);
            assertThat(result.getContent()).extracting(RareGeneticResource::getId).isEmpty();
        }

        @Test
        void shouldApplyRefinementOnNullValue() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.COUNTRY_OF_ORIGIN, Arrays.asList(RareGeneticResource.NULL_VALUE))
                                 .build();

            AggregatedPage<RareGeneticResource> result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(RareGeneticResource::getId).containsOnly("r2");
        }

        @Test
        void shouldApplyRefinementOnEmptyBiotopeType() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.BIOTOPE, Arrays.asList(RareGeneticResource.NULL_VALUE))
                                 .build();

            AggregatedPage<RareGeneticResource> result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(RareGeneticResource::getId).containsOnly("r3");
        }

        @Test
        void shouldApplyRefinementOnEmptyMaterialType() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.MATERIAL, Arrays.asList(RareGeneticResource.NULL_VALUE))
                                 .build();

            AggregatedPage<RareGeneticResource> result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(RareGeneticResource::getId).containsOnly("r3");
        }

        @Test
        void shouldApplyRefinementsOnMultipleTermsWithAnd() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Fungi"))
                                 .withTerm(RareAggregation.BIOTOPE, Arrays.asList("unexisting", "Biotope"))
                                 .build();

            AggregatedPage<RareGeneticResource> result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(RareGeneticResource::getId).containsOnly("r2");

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

            AggregatedPage<RareGeneticResource> result =
                geneticResourceDao.search("hello", true, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(RareGeneticResource::getId).containsOnly("r1", "r3");

            // aggregations are computed based on the result of the full-text-query, not based on the result
            // of the refinements
            Terms domain = result.getAggregations().get(RareAggregation.DOMAIN.getName());
            assertThat(domain.getBuckets()).hasSize(2);
            assertThat(domain.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Plantae", "Fungi");
            assertThat(domain.getBuckets()).extracting(Bucket::getDocCount).containsOnly(2L, 1L);

            result = geneticResourceDao.search("Human", true, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(RareGeneticResource::getId).containsOnly("r1");

            domain = result.getAggregations().get(RareAggregation.DOMAIN.getName());
            assertThat(domain.getBuckets()).hasSize(1);
            assertThat(domain.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Plantae");
            assertThat(domain.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
        }
    }

    private void shouldSuggest(BiConsumer<RareGeneticResource.Builder, String> config) {
        RareGeneticResource.Builder geneticResourceBuilder = RareGeneticResource.builder();
        config.accept(geneticResourceBuilder, "foo bar baz");
        RareGeneticResource geneticResource = geneticResourceBuilder.build();

        geneticResourceDao.saveAll(Collections.singleton(new RareIndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("FOO")).containsExactly("foo bar baz");
        assertThat(geneticResourceDao.suggest("bing")).isEmpty();
    }
}

