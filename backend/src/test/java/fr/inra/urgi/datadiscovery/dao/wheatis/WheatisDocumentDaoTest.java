package fr.inra.urgi.datadiscovery.dao.wheatis;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.ElasticSearchConfig;
import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import fr.inra.urgi.datadiscovery.dao.DocumentDaoTest;
import fr.inra.urgi.datadiscovery.dao.DocumentIndexSettings;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.domain.SearchDocument;
import fr.inra.urgi.datadiscovery.domain.SuggestionDocument;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisDocument;
import org.assertj.core.util.Lists;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms.Bucket;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;
import org.springframework.data.elasticsearch.core.mapping.ElasticsearchPersistentEntity;
import org.springframework.data.elasticsearch.core.query.AliasBuilder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.BiConsumer;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@TestPropertySource("/test-wheatis.properties")
@Import(ElasticSearchConfig.class)
@JsonTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles(AppProfile.WHEATIS)
class WheatisDocumentDaoTest extends DocumentDaoTest {

    private static final String PHYSICAL_INDEX = "test-wheatis-resource-physical-index";
    private static final String SUGGESTION_INDEX = "test-wheatis-suggestions";

    @Autowired
    private WheatisDocumentDao documentDao;

    private Pageable firstPage = PageRequest.of(0, 10);

    @BeforeAll
    void prepareIndex() {
        ElasticsearchPersistentEntity documentEntity = elasticsearchTemplate.getPersistentEntityFor(
                WheatisDocument.class);
        ElasticsearchPersistentEntity suggestionDocumentEntity = elasticsearchTemplate.getPersistentEntityFor(
                SuggestionDocument.class);
        elasticsearchTemplate.deleteIndex(PHYSICAL_INDEX);
        elasticsearchTemplate.createIndex(PHYSICAL_INDEX, DocumentIndexSettings.createSettings());
        elasticsearchTemplate.deleteIndex(SUGGESTION_INDEX);
        elasticsearchTemplate.createIndex(SUGGESTION_INDEX, DocumentIndexSettings.createSuggestionsSettings());
        elasticsearchTemplate.addAlias(
            new AliasBuilder().withAliasName(documentEntity.getIndexName())
                    .withIndexName(PHYSICAL_INDEX)
                    .build()
        );
        elasticsearchTemplate.addAlias(
            new AliasBuilder().withAliasName(suggestionDocumentEntity.getIndexName())
                    .withIndexName(SUGGESTION_INDEX)
                    .build()
        );
        elasticsearchTemplate.putMapping(WheatisDocument.class);
        elasticsearchTemplate.putMapping(SuggestionDocument.class);
    }

    @BeforeEach
    void prepare() {
        documentDao.deleteAll();
        documentDao.deleteAllSuggestions();

        ElasticsearchPersistentEntity persistentEntity = elasticsearchTemplate.getPersistentEntityFor(SuggestionDocument.class);
        elasticsearchTemplate.refresh(persistentEntity.getIndexName());
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

        documentDao.saveAll(Collections.singleton(document));
        documentDao.refresh();

//        assertThat(documentDao.findById(document.getId()).get()).isEqualTo(document);
    }

    @Test
    void shouldSearchOnName() {
        shouldSearch(WheatisDocument.Builder::withName);
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
        documentDao.refresh();

        assertThat(documentDao.search("bar",
                                             false,
                                             false,
                                             SearchRefinements.EMPTY,
                                             firstPage).getContent()).isEmpty();
    }

    @Test
    void shouldSuggest() {
        List<SuggestionDocument> suggestionDocuments = Lists.newArrayList(SuggestionDocument.builder().withSuggestion("Hello").build());
        suggestionDocuments.add(SuggestionDocument.builder().withSuggestion("world").build());
        documentDao.saveAllSuggestions(suggestionDocuments);

        assertThat(documentDao.suggest("hel")).containsOnly("Hello");
        assertThat(documentDao.suggest("wor")).containsOnly("world");
    }

    private void shouldSearch(BiConsumer<WheatisDocument.Builder, String> config) {
        WheatisDocument.Builder documentBuilder = WheatisDocument.builder();
        config.accept(documentBuilder, "foo bar baz");
        WheatisDocument document = documentBuilder.build();

        documentDao.saveAll(Collections.singleton(document));
        documentDao.refresh();

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

        documentDao.saveAll(Arrays.asList(document1, document2));
        documentDao.refresh();

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

        documentDao.saveAll(Arrays.asList(document1, document2));
        documentDao.refresh();

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

        documentDao.saveAll(Arrays.asList(resource1, resource2, resource3, resource4));
        documentDao.refresh();

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

        documentDao.saveAll(Arrays.asList(resource1, resource2));
        documentDao.refresh();

        AggregatedPage<WheatisDocument> result = documentDao.search("comes sun",
                                                                                  false,
                                                                                  true,
                                                                                  SearchRefinements.EMPTY,
                                                                                  firstPage);

        assertThat(result.getContent())
            .extracting(WheatisDocument::getDescription)
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

            documentDao.saveAll(Arrays.asList(document1, document2, document3));
            documentDao.refresh();
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
                                 .withTerm(WheatisAggregation.SPECIES, Arrays.asList(SearchDocument.NULL_VALUE))
                                 .build();

            AggregatedPage<WheatisDocument> result =
                documentDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(WheatisDocument::getId).containsOnly("r3");
        }
    }

}
