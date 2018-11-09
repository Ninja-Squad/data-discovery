package fr.inra.urgi.datadiscovery.dao.wheatis;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.BiConsumer;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.ElasticSearchConfig;
import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import fr.inra.urgi.datadiscovery.dao.DocumentIndexSettings;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.domain.Document;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisDocument;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisIndexedDocument;
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

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@TestPropertySource("/test-wheatis.properties")
@Import(ElasticSearchConfig.class)
@JsonTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles(AppProfile.WHEATIS)
class WheatisDocumentDaoTest {

    private static final String PHYSICAL_INDEX = "test-wheatis-resource-physical-index";

    @Autowired
    private WheatisDocumentDao documentDao;

    @Autowired
    private ElasticsearchTemplate elasticsearchTemplate;

    private Pageable firstPage = PageRequest.of(0, 10);

    @BeforeAll
    void prepareIndex() {
        ElasticsearchPersistentEntity indexedDocumentEntity = elasticsearchTemplate.getPersistentEntityFor(
            WheatisIndexedDocument.class);
        ElasticsearchPersistentEntity documentEntity = elasticsearchTemplate.getPersistentEntityFor(
            WheatisDocument.class);
        elasticsearchTemplate.deleteIndex(PHYSICAL_INDEX);
        elasticsearchTemplate.createIndex(PHYSICAL_INDEX, DocumentIndexSettings.createSettings());
        elasticsearchTemplate.addAlias(
            new AliasBuilder().withAliasName(indexedDocumentEntity.getIndexName())
                              .withIndexName(PHYSICAL_INDEX)
                              .build()
        );
        elasticsearchTemplate.addAlias(
            new AliasBuilder().withAliasName(documentEntity.getIndexName())
                              .withIndexName(PHYSICAL_INDEX)
                              .build()
        );
        elasticsearchTemplate.putMapping(WheatisIndexedDocument.class);
    }

    @BeforeEach
    void prepare() {
        documentDao.deleteAll();
    }

    @Test
    void shouldSaveAndGet() {
        WheatisDocument document =
            WheatisDocument.builder()
                                  .withId("14_mtDNA")
                                  .withEntryType("Marker")
                                  .withDatabaseName("Evoltree")
                                  .withDescription("14_mtDNA is a RFLP marker. It is used in GD2 database for the species Pinus banksiana.")
                                  .withUrl("http://www.evoltree.eu/zf2/public/elab/details?id=MARKER_14_mtDNA&st=fulltext&page=1")
                                  .withSpecies(Collections.singletonList("Pinus banksiana"))
                                  .withNode("URGI")
                                  .build();

        documentDao.saveAll(Collections.singleton(new WheatisIndexedDocument(document)));

        assertThat(documentDao.findById(document.getId()).get()).isEqualTo(document);
    }

    @Test
    void shouldSearchOnId() {
        shouldSearch(WheatisDocument.Builder::withId);
    }

    @Test
    void shouldSearchOnDescription() {
        shouldSearch(WheatisDocument.Builder::withDescription);
    }

    @Test
    void shouldSearchOnEntryType() {
        shouldSearch(WheatisDocument.Builder::withEntryType);
    }

    @Test
    void shouldSearchOnDatabaseName() {
        shouldSearch(WheatisDocument.Builder::withDatabaseName);
    }

    @Test
    void shouldSearchOnSpecies() {
        shouldSearch((b, s) -> b.withSpecies(Collections.singletonList(s)));
    }

    @Test
    void shouldSearchOnNode() {
        shouldSearch(WheatisDocument.Builder::withNode);
    }

    @Test
    void shouldNotSearchOnUrl() {
        WheatisDocument document =
            WheatisDocument.builder().withUrl("foo bar baz").build();
        documentDao.save(document);

        assertThat(documentDao.search("bar",
                                             false,
                                             false,
                                             SearchRefinements.EMPTY,
                                             firstPage).getContent()).isEmpty();
    }

    @Test
    void shouldSuggestOnId() {
        shouldSuggest(WheatisDocument.Builder::withId);
    }

    @Test
    void shouldSuggestOnDescription() {
        WheatisDocument document =
            WheatisDocument.builder().withDescription("Hello world").build();
        documentDao.saveAll(Collections.singleton(new WheatisIndexedDocument(document)));

        assertThat(documentDao.suggest("hel")).containsOnly("Hello");
        assertThat(documentDao.suggest("wor")).containsOnly("world");
    }

    @Test
    void shouldSuggestOnEntryType() {
        shouldSuggest(WheatisDocument.Builder::withEntryType);
    }

    @Test
    void shouldSuggestOnDatabaseName() {
        shouldSuggest(WheatisDocument.Builder::withDatabaseName);
    }

    @Test
    void shouldSuggestOnSpecies() {
        shouldSuggest((b, s) -> b.withSpecies(Collections.singletonList(s)));
    }

    @Test
    void shouldSuggestOnNode() {
        shouldSuggest(WheatisDocument.Builder::withNode);
    }

    @Test
    void shouldNotSuggestOnUrl() {
        WheatisDocument document =
            WheatisDocument.builder().withUrl("foo bar baz").build();
        documentDao.saveAll(Collections.singleton(new WheatisIndexedDocument(document)));

        assertThat(documentDao.suggest("foo")).isEmpty();
    }

    private void shouldSearch(BiConsumer<WheatisDocument.Builder, String> config) {
        WheatisDocument.Builder documentBuilder = WheatisDocument.builder();
        config.accept(documentBuilder, "foo bar baz");
        WheatisDocument document = documentBuilder.build();

        documentDao.saveAll(Collections.singleton(new WheatisIndexedDocument(document)));

        AggregatedPage<WheatisDocument> result =
            documentDao.search("bar", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getAggregations()).isNull();

        result = documentDao.search("bing", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void shouldSearchAndAggregate() {
        WheatisDocument document1 =
            WheatisDocument.builder()
                                  .withId("r1")
                                  .withEntryType("foo")
                                  .withDatabaseName("Plantae")
                                  .withNode("URGI")
                                  .withSpecies(Arrays.asList("Vitis vinifera"))
                                  .build();

        WheatisDocument document2 =
            WheatisDocument.builder()
                                  .withId("r2")
                                  .withEntryType("bar foo")
                                  .withDatabaseName("Fungi")
                                  .withNode("URGI")
                                  .withSpecies(Arrays.asList("Girolla mucha gusta"))
                                  .build();

        documentDao.saveAll(Arrays.asList(new WheatisIndexedDocument(document1),
                                                 new WheatisIndexedDocument(document2)));

        AggregatedPage<WheatisDocument> result =
            documentDao.search("foo", true, false, SearchRefinements.EMPTY, firstPage);
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
        shouldAggregateEmptyArrayAsNullValue(WheatisAggregation.SPECIES, WheatisDocument.Builder::withSpecies);
    }

    private void shouldAggregateEmptyArrayAsNullValue(WheatisAggregation wheatisAggregation,
                                                      BiConsumer<WheatisDocument.Builder, List<String>> initializer) {
        WheatisDocument.Builder resource1Builder = WheatisDocument.builder()
                                                                                .withId("r1")
                                                                                .withEntryType("bar");
        initializer.accept(resource1Builder, Collections.singletonList("foo"));
        WheatisDocument document1 = resource1Builder.build();

        WheatisDocument document2 = WheatisDocument.builder()
                                                                        .withId("r2")
                                                                        .withEntryType("bar")
                                                                        .build();

        documentDao.saveAll(Arrays.asList(new WheatisIndexedDocument(document1),
                                                 new WheatisIndexedDocument(document2)));

        AggregatedPage<WheatisDocument> result =
            documentDao.search("bar", true, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(2);

        Terms aggregation = result.getAggregations().get(wheatisAggregation.getName());
        assertThat(aggregation.getName()).isEqualTo(wheatisAggregation.getName());
        assertThat(aggregation.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("foo", WheatisDocument.NULL_VALUE);
        assertThat(aggregation.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
    }

    @Test
    void shouldFindPillars() {
        WheatisDocument resource1 = WheatisDocument.builder()
                                                                 .withId("r1")
                                                                 .withNode("P1")
                                                                 .withDatabaseName("D11")
                                                                 .build();

        WheatisDocument resource2 = WheatisDocument.builder()
                                                                 .withId("r2")
                                                                 .withNode("P1")
                                                                 .withDatabaseName("D11")
                                                                 .build();

        WheatisDocument resource3 = WheatisDocument.builder()
                                                                 .withId("r3")
                                                                 .withNode("P1")
                                                                 .withDatabaseName("D12")
                                                                 .build();

        WheatisDocument resource4 = WheatisDocument.builder()
                                                                 .withId("r4")
                                                                 .withNode("P2")
                                                                 .withDatabaseName("D21")
                                                                 .build();

        documentDao.saveAll(Arrays.asList(
            new WheatisIndexedDocument(resource1),
            new WheatisIndexedDocument(resource2),
            new WheatisIndexedDocument(resource3),
            new WheatisIndexedDocument(resource4)));

        Terms pillars = documentDao.findPillars();

        assertThat(pillars.getBuckets()).hasSize(2);

        Bucket p1 = pillars.getBucketByKey("P1");

        Terms databaseSource = p1.getAggregations().get(DocumentDao.DATABASE_SOURCE_AGGREGATION_NAME);
        assertThat(databaseSource.getBuckets()).hasSize(2);

        Bucket d11 = databaseSource.getBucketByKey("D11");
        assertThat(d11.getDocCount()).isEqualTo(2);
        Terms d11Url = d11.getAggregations().get(DocumentDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d11Url).isNull();

        Bucket d12 = databaseSource.getBucketByKey("D12");
        assertThat(d12.getDocCount()).isEqualTo(1);
        Terms d12Url = d12.getAggregations().get(WheatisDocumentDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d12Url).isNull();

        Bucket p2 = pillars.getBucketByKey("P2");

        databaseSource = p2.getAggregations().get(WheatisDocumentDao.DATABASE_SOURCE_AGGREGATION_NAME);
        assertThat(databaseSource.getBuckets()).hasSize(1);

        Bucket d21 = databaseSource.getBucketByKey("D21");
        assertThat(d21.getDocCount()).isEqualTo(1);
        Terms d21Url = d21.getAggregations().get(WheatisDocumentDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d21Url).isNull();
    }

    @Test
    void shouldHighlightDescription() {
        WheatisDocument resource1 =
            WheatisDocument.builder()
                                  .withId("r1")
                                  .withDescription("Here comes the sun, <p>tadadada</p>. It's alright.")
                                  .build();


        WheatisDocument resource2 =
            WheatisDocument.builder()
                                  .withId("r2")
                                  .withEntryType("The sun.")
                                  .withDescription("Imagine all the people")
                                  .build();

        documentDao.saveAll(Arrays.asList(new WheatisIndexedDocument(resource1),
                                                 new WheatisIndexedDocument(resource2)));

        AggregatedPage<WheatisDocument> result = documentDao.search("comes sun",
                                                                                  false,
                                                                                  true,
                                                                                  SearchRefinements.EMPTY,
                                                                                  firstPage);

        assertThat(result.getContent())
            .extracting(WheatisGeneticResource::getDescription)
            .containsOnly("Here <em>comes</em> the <em>sun</em>, &lt;p&gt;tadadada&lt;&#x2F;p&gt;. It&#x27;s alright.",
                          "Imagine all the people");
    }

    @Nested
    class RefinementTest {
        @BeforeEach
        void prepare() {
            WheatisDocument document1 = WheatisDocument.builder()
                                                                            .withId("r1")
                                                                            .withNode("URGI")
                                                                            .withDatabaseName("Evoltree")
                                                                            .withEntryType("Marker")
                                                                            .withSpecies(Collections.singletonList("Pinus banksiana"))
                                                                            .withDescription("hello world")
                                                                            .build();

            WheatisDocument document2 = WheatisDocument.builder()
                                                                            .withId("r2")
                                                                            .withNode("URGI")
                                                                            .withDatabaseName("GnpIS")
                                                                            .withEntryType("QTL")
                                                                            .withSpecies(Collections.singletonList("Quercus robur"))
                                                                            .withDescription("hello world")
                                                                            .build();

            WheatisDocument document3 = WheatisDocument.builder()
                                                                            .withId("r3")
                                                                            .withNode("URGI")
                                                                            .withDatabaseName("GnpIS")
                                                                            .withEntryType("QTL")
                                                                            .withDescription("hello world")
                                                                            .build();

            documentDao.saveAll(Arrays.asList(new WheatisIndexedDocument(document1),
                                                     new WheatisIndexedDocument(document2),
                                                     new WheatisIndexedDocument(document3)));
        }

        @Test
        void shouldApplyRefinementsOnSingleTermWithOr() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(WheatisAggregation.ENTRY_TYPE, Arrays.asList("unexisting", "Marker"))
                                 .build();

            AggregatedPage<WheatisDocument> result =
                documentDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(WheatisDocument::getId).containsOnly("r1");

            refinements = SearchRefinements.builder()
                                           .withTerm(WheatisAggregation.DATABASE_NAME, Arrays.asList("unexisting", "GnpIS"))
                                           .build();
            result =
                documentDao.search("hello", false, false, refinements, firstPage);
            assertThat(result.getContent()).extracting(WheatisDocument::getId).containsOnly("r2", "r3");

            refinements = SearchRefinements.builder()
                                           .withTerm(WheatisAggregation.NODE, Arrays.asList("unexisting"))
                                           .build();
            result =
                documentDao.search("hello", false, false, refinements, firstPage);
            assertThat(result.getContent()).extracting(WheatisDocument::getId).isEmpty();
        }

        @Test
        void shouldApplyRefinementOnEmptySpecies() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(WheatisAggregation.SPECIES, Arrays.asList(Document.NULL_VALUE))
                                 .build();

            AggregatedPage<WheatisDocument> result =
                documentDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(WheatisDocument::getId).containsOnly("r3");
        }
    }

    private void shouldSuggest(BiConsumer<WheatisDocument.Builder, String> config) {
        WheatisDocument.Builder documentBuilder = WheatisDocument.builder();
        config.accept(documentBuilder, "foo bar baz");
        WheatisDocument document = documentBuilder.build();

        documentDao.saveAll(Collections.singleton(new WheatisIndexedDocument(document)));

        assertThat(documentDao.suggest("FOO")).containsExactly("foo bar baz");
        assertThat(documentDao.suggest("bing")).isEmpty();
    }
}

