package fr.inra.urgi.rare.dao.wheatis;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.BiConsumer;

import fr.inra.urgi.rare.config.AppProfile;
import fr.inra.urgi.rare.config.ElasticSearchConfig;
import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.dao.GeneticResourceIndexSettings;
import fr.inra.urgi.rare.dao.SearchRefinements;
import fr.inra.urgi.rare.dao.rare.RareGeneticResourceDao;
import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.domain.rare.RareGeneticResource;
import fr.inra.urgi.rare.domain.wheatis.WheatisGeneticResource;
import fr.inra.urgi.rare.domain.wheatis.WheatisIndexedGeneticResource;
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
@TestPropertySource("/test-wheatis.properties")
@Import(ElasticSearchConfig.class)
@JsonTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles(AppProfile.WHEATIS)
class WheatisGeneticResourceDaoTest {

    private static final String PHYSICAL_INDEX = "test-wheatis-resource-physical-index";

    @Autowired
    private WheatisGeneticResourceDao geneticResourceDao;

    @Autowired
    private ElasticsearchTemplate elasticsearchTemplate;

    private Pageable firstPage = PageRequest.of(0, 10);

    @BeforeAll
    void prepareIndex() {
        ElasticsearchPersistentEntity indexedGeneticResourceEntity = elasticsearchTemplate.getPersistentEntityFor(
            WheatisIndexedGeneticResource.class);
        ElasticsearchPersistentEntity geneticResourceEntity = elasticsearchTemplate.getPersistentEntityFor(
            WheatisGeneticResource.class);
        elasticsearchTemplate.deleteIndex(PHYSICAL_INDEX);
        elasticsearchTemplate.createIndex(PHYSICAL_INDEX, GeneticResourceIndexSettings.createSettings());
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
        elasticsearchTemplate.putMapping(WheatisIndexedGeneticResource.class);
    }

    @BeforeEach
    void prepare() {
        geneticResourceDao.deleteAll();
    }

    @Test
    void shouldSaveAndGet() {
        WheatisGeneticResource geneticResource =
            WheatisGeneticResource.builder()
                                  .withId("14_mtDNA")
                                  .withEntryType("Marker")
                                  .withDatabaseName("Evoltree")
                                  .withDescription("14_mtDNA is a RFLP marker. It is used in GD2 database for the species Pinus banksiana.")
                                  .withUrl("http://www.evoltree.eu/zf2/public/elab/details?id=MARKER_14_mtDNA&st=fulltext&page=1")
                                  .withSpecies(Collections.singletonList("Pinus banksiana"))
                                  .withNode("URGI")
                                  .build();

        geneticResourceDao.saveAll(Collections.singleton(new WheatisIndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.findById(geneticResource.getId()).get()).isEqualTo(geneticResource);
    }

    @Test
    void shouldSearchOnId() {
        shouldSearch(WheatisGeneticResource.Builder::withId);
    }

    @Test
    void shouldSearchOnDescription() {
        shouldSearch(WheatisGeneticResource.Builder::withDescription);
    }

    @Test
    void shouldSearchOnEntryType() {
        shouldSearch(WheatisGeneticResource.Builder::withEntryType);
    }

    @Test
    void shouldSearchOnDatabaseName() {
        shouldSearch(WheatisGeneticResource.Builder::withDatabaseName);
    }

    @Test
    void shouldSearchOnSpecies() {
        shouldSearch((b, s) -> b.withSpecies(Collections.singletonList(s)));
    }

    @Test
    void shouldSearchOnNode() {
        shouldSearch(WheatisGeneticResource.Builder::withNode);
    }

    @Test
    void shouldNotSearchOnUrl() {
        WheatisGeneticResource geneticResource =
            WheatisGeneticResource.builder().withUrl("foo bar baz").build();
        geneticResourceDao.save(geneticResource);

        assertThat(geneticResourceDao.search("bar",
                                             false,
                                             false,
                                             SearchRefinements.EMPTY,
                                             firstPage).getContent()).isEmpty();
    }

    @Test
    void shouldSuggestOnId() {
        shouldSuggest(WheatisGeneticResource.Builder::withId);
    }

    @Test
    void shouldSuggestOnDescription() {
        WheatisGeneticResource geneticResource =
            WheatisGeneticResource.builder().withDescription("Hello world").build();
        geneticResourceDao.saveAll(Collections.singleton(new WheatisIndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("hel")).containsOnly("Hello");
        assertThat(geneticResourceDao.suggest("wor")).containsOnly("world");
    }

    @Test
    void shouldSuggestOnEntryType() {
        shouldSuggest(WheatisGeneticResource.Builder::withEntryType);
    }

    @Test
    void shouldSuggestOnDatabaseName() {
        shouldSuggest(WheatisGeneticResource.Builder::withDatabaseName);
    }

    @Test
    void shouldSuggestOnSpecies() {
        shouldSuggest((b, s) -> b.withSpecies(Collections.singletonList(s)));
    }

    @Test
    void shouldSuggestOnNode() {
        shouldSuggest(WheatisGeneticResource.Builder::withNode);
    }

    @Test
    void shouldNotSuggestOnUrl() {
        WheatisGeneticResource geneticResource =
            WheatisGeneticResource.builder().withUrl("foo bar baz").build();
        geneticResourceDao.saveAll(Collections.singleton(new WheatisIndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("foo")).isEmpty();
    }

    private void shouldSearch(BiConsumer<WheatisGeneticResource.Builder, String> config) {
        WheatisGeneticResource.Builder geneticResourceBuilder = WheatisGeneticResource.builder();
        config.accept(geneticResourceBuilder, "foo bar baz");
        WheatisGeneticResource geneticResource = geneticResourceBuilder.build();

        geneticResourceDao.saveAll(Collections.singleton(new WheatisIndexedGeneticResource(geneticResource)));

        AggregatedPage<WheatisGeneticResource> result =
            geneticResourceDao.search("bar", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getAggregations()).isNull();

        result = geneticResourceDao.search("bing", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void shouldSearchAndAggregate() {
        WheatisGeneticResource geneticResource1 =
            WheatisGeneticResource.builder()
                                  .withId("r1")
                                  .withEntryType("foo")
                                  .withDatabaseName("Plantae")
                                  .withNode("URGI")
                                  .withSpecies(Arrays.asList("Vitis vinifera"))
                                  .build();

        WheatisGeneticResource geneticResource2 =
            WheatisGeneticResource.builder()
                                  .withId("r2")
                                  .withEntryType("bar foo")
                                  .withDatabaseName("Fungi")
                                  .withNode("URGI")
                                  .withSpecies(Arrays.asList("Girolla mucha gusta"))
                                  .build();

        geneticResourceDao.saveAll(Arrays.asList(new WheatisIndexedGeneticResource(geneticResource1),
                                                 new WheatisIndexedGeneticResource(geneticResource2)));

        AggregatedPage<WheatisGeneticResource> result =
            geneticResourceDao.search("foo", true, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(2);

        Terms databaseName = result.getAggregations().get(WheatisAggregation.DATABASE_NAME.getName());
        assertThat(databaseName.getName()).isEqualTo(WheatisAggregation.DATABASE_NAME.getName());
        assertThat(databaseName.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Plantae", "Fungi");
        assertThat(databaseName.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);

        Terms entryType = result.getAggregations().get(WheatisAggregation.ENTRY_TYPE.getName());
        assertThat(entryType.getName()).isEqualTo(WheatisAggregation.ENTRY_TYPE.getName());
        assertThat(entryType.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("bar foo", "foo");
        assertThat(entryType.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);

        Terms node = result.getAggregations().get(WheatisAggregation.NODE.getName());
        assertThat(node.getName()).isEqualTo(WheatisAggregation.NODE.getName());
        assertThat(node.getBuckets()).extracting(Bucket::getKeyAsString).containsExactly("URGI");
        assertThat(node.getBuckets()).extracting(Bucket::getDocCount).containsExactly(2L);

        Terms species = result.getAggregations().get(WheatisAggregation.SPECIES.getName());
        assertThat(species.getName()).isEqualTo(WheatisAggregation.SPECIES.getName());
        assertThat(species.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Vitis vinifera", "Girolla mucha gusta");
        assertThat(species.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
    }

    @Test
    void shouldAggregateEmptySpeciesAsNullValue() {
        shouldAggregateEmptyArrayAsNullValue(WheatisAggregation.SPECIES, WheatisGeneticResource.Builder::withSpecies);
    }

    private void shouldAggregateEmptyArrayAsNullValue(WheatisAggregation wheatisAggregation,
                                                      BiConsumer<WheatisGeneticResource.Builder, List<String>> initializer) {
        WheatisGeneticResource.Builder resource1Builder = WheatisGeneticResource.builder()
                                                                                .withId("r1")
                                                                                .withEntryType("bar");
        initializer.accept(resource1Builder, Collections.singletonList("foo"));
        WheatisGeneticResource geneticResource1 = resource1Builder.build();

        WheatisGeneticResource geneticResource2 = WheatisGeneticResource.builder()
                                                                        .withId("r2")
                                                                        .withEntryType("bar")
                                                                        .build();

        geneticResourceDao.saveAll(Arrays.asList(new WheatisIndexedGeneticResource(geneticResource1),
                                                 new WheatisIndexedGeneticResource(geneticResource2)));

        AggregatedPage<WheatisGeneticResource> result =
            geneticResourceDao.search("bar", true, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(2);

        Terms aggregation = result.getAggregations().get(wheatisAggregation.getName());
        assertThat(aggregation.getName()).isEqualTo(wheatisAggregation.getName());
        assertThat(aggregation.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("foo", RareGeneticResource.NULL_VALUE);
        assertThat(aggregation.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
    }

    @Test
    void shouldFindPillars() {
        WheatisGeneticResource resource1 = WheatisGeneticResource.builder()
                                                                 .withId("r1")
                                                                 .withNode("P1")
                                                                 .withDatabaseName("D11")
                                                                 .build();

        WheatisGeneticResource resource2 = WheatisGeneticResource.builder()
                                                                 .withId("r2")
                                                                 .withNode("P1")
                                                                 .withDatabaseName("D11")
                                                                 .build();

        WheatisGeneticResource resource3 = WheatisGeneticResource.builder()
                                                                 .withId("r3")
                                                                 .withNode("P1")
                                                                 .withDatabaseName("D12")
                                                                 .build();

        WheatisGeneticResource resource4 = WheatisGeneticResource.builder()
                                                                 .withId("r4")
                                                                 .withNode("P2")
                                                                 .withDatabaseName("D21")
                                                                 .build();

        geneticResourceDao.saveAll(Arrays.asList(
            new WheatisIndexedGeneticResource(resource1),
            new WheatisIndexedGeneticResource(resource2),
            new WheatisIndexedGeneticResource(resource3),
            new WheatisIndexedGeneticResource(resource4)));

        Terms pillars = geneticResourceDao.findPillars();

        assertThat(pillars.getBuckets()).hasSize(2);

        Bucket p1 = pillars.getBucketByKey("P1");

        Terms databaseSource = p1.getAggregations().get(GeneticResourceDao.DATABASE_SOURCE_AGGREGATION_NAME);
        assertThat(databaseSource.getBuckets()).hasSize(2);

        Bucket d11 = databaseSource.getBucketByKey("D11");
        assertThat(d11.getDocCount()).isEqualTo(2);
        Terms d11Url = d11.getAggregations().get(GeneticResourceDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d11Url).isNull();

        Bucket d12 = databaseSource.getBucketByKey("D12");
        assertThat(d12.getDocCount()).isEqualTo(1);
        Terms d12Url = d12.getAggregations().get(RareGeneticResourceDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d12Url).isNull();

        Bucket p2 = pillars.getBucketByKey("P2");

        databaseSource = p2.getAggregations().get(RareGeneticResourceDao.DATABASE_SOURCE_AGGREGATION_NAME);
        assertThat(databaseSource.getBuckets()).hasSize(1);

        Bucket d21 = databaseSource.getBucketByKey("D21");
        assertThat(d21.getDocCount()).isEqualTo(1);
        Terms d21Url = d21.getAggregations().get(RareGeneticResourceDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d21Url).isNull();
    }

    @Test
    void shouldHighlightDescription() {
        WheatisGeneticResource resource1 =
            WheatisGeneticResource.builder()
                                  .withId("r1")
                                  .withDescription("Here comes the sun, tadadada. It's alright.")
                                  .build();


        WheatisGeneticResource resource2 =
            WheatisGeneticResource.builder()
                                  .withId("r2")
                                  .withEntryType("The sun.")
                                  .withDescription("Imagine all the people")
                                  .build();

        geneticResourceDao.saveAll(Arrays.asList(new WheatisIndexedGeneticResource(resource1),
                                                 new WheatisIndexedGeneticResource(resource2)));

        AggregatedPage<WheatisGeneticResource> result = geneticResourceDao.search("comes sun",
                                                                                  false,
                                                                                  true,
                                                                                  SearchRefinements.EMPTY,
                                                                                  firstPage);

        assertThat(result.getContent())
            .extracting(WheatisGeneticResource::getDescription)
            .containsOnly("Here <em>comes</em> the <em>sun</em>, tadadada. It's alright.", "Imagine all the people");
    }

    @Nested
    class RefinementTest {
        @BeforeEach
        void prepare() {
            WheatisGeneticResource geneticResource1 = WheatisGeneticResource.builder()
                                                                            .withId("r1")
                                                                            .withNode("URGI")
                                                                            .withDatabaseName("Evoltree")
                                                                            .withEntryType("Marker")
                                                                            .withSpecies(Collections.singletonList("Pinus banksiana"))
                                                                            .withDescription("hello world")
                                                                            .build();

            WheatisGeneticResource geneticResource2 = WheatisGeneticResource.builder()
                                                                            .withId("r2")
                                                                            .withNode("URGI")
                                                                            .withDatabaseName("GnpIS")
                                                                            .withEntryType("QTL")
                                                                            .withSpecies(Collections.singletonList("Quercus robur"))
                                                                            .withDescription("hello world")
                                                                            .build();

            WheatisGeneticResource geneticResource3 = WheatisGeneticResource.builder()
                                                                            .withId("r3")
                                                                            .withNode("URGI")
                                                                            .withDatabaseName("GnpIS")
                                                                            .withEntryType("QTL")
                                                                            .withDescription("hello world")
                                                                            .build();

            geneticResourceDao.saveAll(Arrays.asList(new WheatisIndexedGeneticResource(geneticResource1),
                                                     new WheatisIndexedGeneticResource(geneticResource2),
                                                     new WheatisIndexedGeneticResource(geneticResource3)));
        }

        @Test
        void shouldApplyRefinementsOnSingleTermWithOr() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(WheatisAggregation.ENTRY_TYPE, Arrays.asList("unexisting", "Marker"))
                                 .build();

            AggregatedPage<WheatisGeneticResource> result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(WheatisGeneticResource::getId).containsOnly("r1");

            refinements = SearchRefinements.builder()
                                           .withTerm(WheatisAggregation.DATABASE_NAME, Arrays.asList("unexisting", "GnpIS"))
                                           .build();
            result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);
            assertThat(result.getContent()).extracting(WheatisGeneticResource::getId).containsOnly("r2", "r3");

            refinements = SearchRefinements.builder()
                                           .withTerm(WheatisAggregation.NODE, Arrays.asList("unexisting"))
                                           .build();
            result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);
            assertThat(result.getContent()).extracting(WheatisGeneticResource::getId).isEmpty();
        }

        @Test
        void shouldApplyRefinementOnEmptySpecies() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(WheatisAggregation.SPECIES, Arrays.asList(GeneticResource.NULL_VALUE))
                                 .build();

            AggregatedPage<WheatisGeneticResource> result =
                geneticResourceDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(WheatisGeneticResource::getId).containsOnly("r3");
        }
    }

    private void shouldSuggest(BiConsumer<WheatisGeneticResource.Builder, String> config) {
        WheatisGeneticResource.Builder geneticResourceBuilder = WheatisGeneticResource.builder();
        config.accept(geneticResourceBuilder, "foo bar baz");
        WheatisGeneticResource geneticResource = geneticResourceBuilder.build();

        geneticResourceDao.saveAll(Collections.singleton(new WheatisIndexedGeneticResource(geneticResource)));

        assertThat(geneticResourceDao.suggest("FOO")).containsExactly("foo bar baz");
        assertThat(geneticResourceDao.suggest("bing")).isEmpty();
    }
}

