package fr.inra.urgi.datadiscovery.dao.wheatis;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.BiConsumer;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.ElasticSearchConfig;
import fr.inra.urgi.datadiscovery.dao.AggregationSelection;
import fr.inra.urgi.datadiscovery.dao.AggregationTester;
import fr.inra.urgi.datadiscovery.dao.DocumentDaoTest;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.domain.AggregatedPage;
import fr.inra.urgi.datadiscovery.domain.SearchDocument;
import fr.inra.urgi.datadiscovery.domain.SuggestionDocument;
import fr.inra.urgi.datadiscovery.domain.wheatis.WheatisDocument;
import fr.inra.urgi.datadiscovery.pillar.DatabaseSourceDTO;
import fr.inra.urgi.datadiscovery.pillar.PillarDTO;
import org.assertj.core.util.Lists;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.condition.DisabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.elasticsearch.test.autoconfigure.DataElasticsearchTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource("/test-wheatis.properties")
@Import(ElasticSearchConfig.class)
@DataElasticsearchTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles(AppProfile.WHEATIS)
@DisabledIfEnvironmentVariable(named ="CIRCLECI", matches = "true", disabledReason = "Avoid to run ES tests depending on synonyms on CircleCI")
class WheatisDocumentDaoTest extends DocumentDaoTest {

    private static final String PHYSICAL_INDEX = "test-wheatis-resource-physical-index";
    private static final String SUGGESTION_INDEX = "test-wheatis-suggestions";

    @Autowired
    private WheatisDocumentDao documentDao;

    private Pageable firstPage = PageRequest.of(0, 10);

    @BeforeAll
    void prepareIndex() {
        deleteIndex(PHYSICAL_INDEX);
        createDocumentIndex(PHYSICAL_INDEX, AppProfile.WHEATIS);

        deleteIndex(SUGGESTION_INDEX);
        createSuggestionIndex(SUGGESTION_INDEX);

        createAlias(PHYSICAL_INDEX, WheatisDocument.class);
        createAlias(SUGGESTION_INDEX, SuggestionDocument.class);

        putMapping(WheatisDocument.class);
        putMapping(SuggestionDocument.class);
    }

    @BeforeEach
    void prepare() {
        documentDao.deleteAll();
        documentDao.deleteAllSuggestions();
        elasticsearchTemplate.indexOps(elasticsearchTemplate.getIndexCoordinatesFor(SuggestionDocument.class)).refresh();
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
        assertThat(documentDao.findById(document.getId()).get()).isEqualTo(document);
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
        assertThat(result.getAggregations()).isEmpty();

        result = documentDao.search("bing", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void shouldAggregate() {
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
            documentDao.aggregate("foo", SearchRefinements.EMPTY, AggregationSelection.ALL, false);
        assertThat(result.getContent()).hasSize(1);

        AggregationTester databaseName = new AggregationTester(result.getAggregation(WheatisAggregation.DATABASE_NAME.getName()));
        assertThat(databaseName.getKeys()).containsOnly("Plantae", "Fungi");
        assertThat(databaseName.getDocumentCounts()).containsOnly(1L);

        AggregationTester entryType = new AggregationTester(result.getAggregation(WheatisAggregation.ENTRY_TYPE.getName()));
        assertThat(entryType.getKeys()).containsOnly("bar foo", "foo");
        assertThat(entryType.getDocumentCounts()).containsOnly(1L);

        AggregationTester node = new AggregationTester(result.getAggregation(WheatisAggregation.NODE.getName()));
        assertThat(node.getKeys()).containsExactly("URGI");
        assertThat(node.getDocumentCounts()).containsExactly(2L);

        AggregationTester species = new AggregationTester(result.getAggregation(WheatisAggregation.SPECIES.getName()));
        assertThat(species.getKeys()).containsOnly("Vitis vinifera", "Girolla mucha gusta");
        assertThat(species.getDocumentCounts()).containsOnly(1L);
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
            documentDao.aggregate("bar",  SearchRefinements.EMPTY, AggregationSelection.ALL, false);
        assertThat(result.getContent()).hasSize(1);

        AggregationTester aggregation = new AggregationTester(result.getAggregation(wheatisAggregation.getName()));
        assertThat(aggregation.getKeys()).containsOnly("foo", WheatisDocument.NULL_VALUE);
        assertThat(aggregation.getDocumentCounts()).containsOnly(1L);
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

        List<PillarDTO> pillars = documentDao.findPillars();
        assertThat(pillars).hasSize(2);

        PillarDTO p1 = pillars.stream().filter(p -> p.getName().equals("P1")).findAny().orElseThrow();

        assertThat(p1.getDatabaseSources()).containsOnly(
            new DatabaseSourceDTO("D11", null, 2),
            new DatabaseSourceDTO("D12", null, 1)
        );

        PillarDTO p2 = pillars.stream().filter(p -> p.getName().equals("P2")).findAny().orElseThrow();
        assertThat(p2.getDatabaseSources()).containsOnly(
            new DatabaseSourceDTO("D21", null, 1)
        );
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
                                                                    true,
                                                                    false,
                                                                    SearchRefinements.EMPTY,
                                                                    firstPage);

        assertThat(result.getContent())
            .extracting(WheatisDocument::getDescription)
            .containsOnly("Here <em>comes</em> the <em>sun</em>, &lt;p&gt;tadadada&lt;&#x2F;p&gt;. It&#x27;s alright.",
                          "Imagine all the people");
    }

    @Test
    void shouldHighlightSynonymsInDescription() {
        WheatisDocument resource1 =
                WheatisDocument.builder()
                               .withId("r1")
                               .withDescription("wheat is good for your health, <p>or maybe not</p>, I don't know. In French, le blé est bon.")
                               .build();


        WheatisDocument resource2 =
                WheatisDocument.builder()
                               .withId("r2")
                               .withDescription("Triticum is very diverse and it includes diploid, tetraploid and hexaploid")
                               .build();

        documentDao.saveAll(Arrays.asList(resource1, resource2));
        documentDao.refresh();

        AggregatedPage<WheatisDocument> result = documentDao.search("blé",
                                                                    true,
                                                                    true,
                                                                    SearchRefinements.EMPTY,
                                                                    firstPage);

        assertThat(result.getContent())
                .extracting(WheatisDocument::getDescription)
                .containsOnly("<em>wheat</em> is good for your health, &lt;p&gt;or maybe not&lt;&#x2F;p&gt;, I don&#x27;t know. In French, le <em>blé</em> est bon.",
                        "<em>Triticum</em> is very diverse and it includes diploid, tetraploid and hexaploid");
    }

    @Nested
    @DisplayName("Test group for refinement / aggregations")
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
                                                       .withAnnotationId(Collections.singletonList("GO:1234567"))
                                                       .withAnnotationName(Collections.singletonList("blah (GO:1234567)"))
                                                       .build();

            WheatisDocument document2 = WheatisDocument.builder()
                                                       .withId("r2")
                                                       .withNode("URGI")
                                                       .withDatabaseName("GnpIS")
                                                       .withEntryType("QTL")
                                                       .withSpecies(Collections.singletonList("Quercus robur"))
                                                       .withDescription("hello world")
                                                       .withAnnotationId(Collections.singletonList("GO:1234567"))
                                                       .withAnnotationName(Collections.singletonList("blah (GO:1234567)"))
                                                       .build();

            WheatisDocument document3 = WheatisDocument.builder()
                                                       .withId("r3")
                                                       .withNode("URGI")
                                                       .withDatabaseName("GnpIS")
                                                       .withEntryType("QTL")
                                                       .withDescription("hello world")
                                                       .withAnnotationId(Collections.singletonList("GO:8888"))
                                                       .withAnnotationName(Collections.singletonList("bad blah (GO:8888888)"))
                                                       .withAncestors(Collections.singletonList("GO:1234567/GO:8888888"))
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


        @Test
        void shouldApplyRefinementsOnAnnotationWithOrWithoutDescendants() {

            SearchRefinements refinements =
                    SearchRefinements.builder()
                            .withTerm(WheatisAggregation.GO_ANNOTATION, Arrays.asList("blah (GO:1234567)"))
                            .build();

            AggregatedPage<WheatisDocument> result =
                    documentDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(WheatisDocument::getId).containsOnly("r1", "r2");

            result =
                    documentDao.search("hello", false, true, refinements, firstPage);
            assertThat(result.getContent()).extracting(WheatisDocument::getId).containsOnly("r1", "r2", "r3");
        }

    }

}
