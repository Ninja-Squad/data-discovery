package fr.inra.urgi.datadiscovery.dao.faidare;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.ElasticSearchConfig;
import fr.inra.urgi.datadiscovery.dao.AggregationSelection;
import fr.inra.urgi.datadiscovery.dao.AggregationTester;
import fr.inra.urgi.datadiscovery.dao.DocumentDaoTest;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.domain.AggregatedPage;
import fr.inra.urgi.datadiscovery.domain.SearchDocument;
import fr.inra.urgi.datadiscovery.domain.SuggestionDocument;
import fr.inra.urgi.datadiscovery.domain.faidare.FaidareDocument;
import fr.inra.urgi.datadiscovery.dto.AggregationDTO;
import fr.inra.urgi.datadiscovery.filter.faidare.FaidareCurrentUser;
import fr.inra.urgi.datadiscovery.filter.faidare.FaidareUser;
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
import org.springframework.boot.test.autoconfigure.data.elasticsearch.DataElasticsearchTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource("/test-faidare.properties")
@Import(ElasticSearchConfig.class)
@DataElasticsearchTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles(AppProfile.FAIDARE)
@DisabledIfEnvironmentVariable(named ="CIRCLECI", matches = "true", disabledReason = "Avoid to run ES tests depending on synonyms on CircleCI")
class FaidareDocumentDaoTest extends DocumentDaoTest {

    private static final String PHYSICAL_INDEX = "test-faidare-resource-physical-index";
    private static final String SUGGESTION_INDEX = "test-faidare-suggestions";

    @MockBean
    private FaidareCurrentUser mockCurrentUser;

    @Autowired
    private FaidareDocumentDao documentDao;

    private Pageable firstPage = PageRequest.of(0, 10);

    @BeforeAll
    void prepareIndex() {
        deleteIndex(PHYSICAL_INDEX);
        createDocumentIndex(PHYSICAL_INDEX, AppProfile.FAIDARE);

        deleteIndex(SUGGESTION_INDEX);
        createSuggestionIndex(SUGGESTION_INDEX);

        createAlias(PHYSICAL_INDEX, FaidareDocument.class);
        createAlias(SUGGESTION_INDEX, SuggestionDocument.class);

        putMapping(FaidareDocument.class);
        putMapping(SuggestionDocument.class);
    }

    @BeforeEach
    void prepare() {
        when(mockCurrentUser.get()).thenReturn(FaidareUser.ANONYMOUS);

        documentDao.deleteAll();
        documentDao.deleteAllSuggestions();
        elasticsearchTemplate.indexOps(elasticsearchTemplate.getIndexCoordinatesFor(SuggestionDocument.class)).refresh();
    }

    @Test
    void shouldSaveAndGet() {
        FaidareDocument document =
            FaidareDocument.builder()
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
        shouldSearch(FaidareDocument.Builder::withName);
    }

    @Test
    void shouldSearchOnDescription() {
        shouldSearch(FaidareDocument.Builder::withDescription);
    }

    @Test
    void shouldSearchOnEntryType() {
        shouldSearch(FaidareDocument.Builder::withEntryType);
    }

    @Test
    void shouldSearchOnDatabaseName() {
        shouldSearch(FaidareDocument.Builder::withDatabaseName);
    }

    @Test
    void shouldSearchOnSpecies() {
        shouldSearch((b, s) -> b.withSpecies(Collections.singletonList(s)));
    }

    @Test
    void shouldSearchOnNode() {
        shouldSearch(FaidareDocument.Builder::withNode);
    }

    @Test
    void shouldSearchOnHoldingInstitute() {
        shouldSearch(FaidareDocument.Builder::withHoldingInstitute);
    }

    @Test
    void shouldSearchOnBiologicalStatus() {
        shouldSearch(FaidareDocument.Builder::withBiologicalStatus);
    }

    @Test
    void shouldSearchOnGeneticNature() {
        shouldSearch(FaidareDocument.Builder::withGeneticNature);
    }

    @Test
    void shouldSearchOnCountryOfOrigin() {
        shouldSearch(FaidareDocument.Builder::withCountryOfOrigin);
    }

    @Test
    void shouldSearchOnTaxonGroup() {
        shouldSearch((b, s) -> b.withTaxonGroup(Collections.singletonList(s)));
    }

    @Test
    void shouldSearchOnObservationVariableIds() {
        shouldSearch((b, s) -> b.withObservationVariableIds(Collections.singletonList(s)));
    }

    @Test
    void shouldNotSearchOnUrl() {
        FaidareDocument document =
            FaidareDocument.builder().withUrl("foo bar baz").build();
        documentDao.save(document);
        documentDao.refresh();

        assertThat(documentDao.search("bar",
                false,
                false,
                SearchRefinements.EMPTY,
                firstPage).getContent()).isEmpty();
    }

    @Test
    void shouldOnlySearchAccessibleDocuments() {
        when(mockCurrentUser.get()).thenReturn(new FaidareUser("john", new HashSet<>(Arrays.asList(0, 2))));
        documentDao.saveAll(Arrays.asList(
            FaidareDocument.builder().withId("id1").withDescription("foobar 1").withGroupId(0).build(),
            FaidareDocument.builder().withId("id2").withDescription("foobar 2").withGroupId(1).build(),
            FaidareDocument.builder().withId("id3").withDescription("foobar 3").withGroupId(2).build(),
            FaidareDocument.builder().withId("id5").withDescription("other").withGroupId(0).build()
        ));
        documentDao.refresh();

        AggregatedPage<FaidareDocument> result = documentDao.search("foobar",
                                                                    false,
                                                                    false,
                                                                    SearchRefinements.builder().build(),
                                                                    PageRequest.of(0, 20));
        assertThat(result).extracting(FaidareDocument::getId).containsOnly("id1", "id3");
    }

    @Test
    void shouldSuggest() {
        List<SuggestionDocument> suggestionDocuments = Lists.newArrayList(SuggestionDocument.builder().withSuggestion("Hello").build());
        suggestionDocuments.add(SuggestionDocument.builder().withSuggestion("world").build());
        documentDao.saveAllSuggestions(suggestionDocuments);

        assertThat(documentDao.suggest("hel")).containsOnly("Hello");
        assertThat(documentDao.suggest("wor")).containsOnly("world");
    }

    private void shouldSearch(BiConsumer<FaidareDocument.Builder, String> config) {
        FaidareDocument.Builder documentBuilder = FaidareDocument.builder();
        config.accept(documentBuilder, "foo bar baz");
        FaidareDocument document = documentBuilder.build();

        documentDao.saveAll(Collections.singleton(document));
        documentDao.refresh();

        AggregatedPage<FaidareDocument> result =
            documentDao.search("bar", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getAggregations()).isEmpty();

        result = documentDao.search("bing", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void shouldSearchWithBlankQuery() {
        FaidareDocument.Builder documentBuilder = FaidareDocument.builder();
        FaidareDocument document = documentBuilder.build();

        documentDao.saveAll(Collections.singleton(document));
        documentDao.refresh();

        AggregatedPage<FaidareDocument> result =
                documentDao.search("  ", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void shouldHonorSort() {
        documentDao.saveAll(Arrays.asList(
            FaidareDocument.builder().withId("id1").withDescription("foobar 1").withCountryOfOrigin("France").build(),
            FaidareDocument.builder().withId("id2").withDescription("foobar foobar foobar 2").withCountryOfOrigin("Germany").build(),
            FaidareDocument.builder().withId("id3").withDescription("foobar 3").withCountryOfOrigin("Belgium").build(),
            FaidareDocument.builder().withId("id4").withDescription("foobar 4").withCountryOfOrigin("China").build(),
            FaidareDocument.builder().withId("id5").withDescription("other 5").withEntryType("France").build()
        ));
        documentDao.refresh();

        AggregatedPage<FaidareDocument> result = documentDao.search("foobar",
                                                                    false,
                                                                    false,
                                                                    SearchRefinements.builder().build(),
                                                                    PageRequest.of(0, 20, FaidareSort.COUNTRY_OF_ORIGIN.toSort(Sort.Direction.ASC)));
        assertThat(result).extracting(FaidareDocument::getId).containsExactly("id3", "id4", "id1", "id2");

        // all the faidare sorts should not throw
        for (FaidareSort faidareSort : FaidareSort.values()) {
            assertThatCode(() -> {
                documentDao.search("foobar",
                                   false,
                                   false,
                                   SearchRefinements.builder().build(),
                                   PageRequest.of(0, 20, faidareSort.toSort(Sort.Direction.ASC)));
            }).withFailMessage("Sorting with faidareSort " + faidareSort).doesNotThrowAnyException();
        }
    }

    @Test
    void shouldFindAllIds() {
        documentDao.saveAll(Arrays.asList(
            FaidareDocument.builder().withId("id1").withDescription("foobar 1").withEntryType("germplasm").withGermplasmDbId("gdid1").build(),
            FaidareDocument.builder().withId("id2").withDescription("foobar 2").withEntryType("germplasm").withGermplasmDbId("gdid2").build(),
            FaidareDocument.builder().withId("id3").withDescription("foobar 3").withEntryType("germplasm").withGermplasmDbId("gdid3").build(),
            FaidareDocument.builder().withId("id4").withDescription("foobar 4").withEntryType("other").withGermplasmDbId("gdid4").build(),
            FaidareDocument.builder().withId("id5").withDescription("other 5").withEntryType("germplasm").withGermplasmDbId("gdid5").build()
        ));
        documentDao.refresh();

        Set<String> ids = documentDao.findAllIds("foobar",
                                                 false,
                                                 SearchRefinements.builder()
                                                                  .withTerm(FaidareAggregation.ENTRY_TYPE,
                                                                            Collections.singletonList("germplasm"))
                                                                  .build());
        assertThat(ids).containsOnly("id1", "id2", "id3");
    }


    @Test
    void shouldFindAllGermplasmDbIds() {
        documentDao.saveAll(Arrays.asList(
                FaidareDocument.builder().withId("id1").withDescription("foobar 1").withEntryType("germplasm").withGermplasmDbId("gdid1").build(),
                FaidareDocument.builder().withId("id2").withDescription("foobar 2").withEntryType("germplasm").withGermplasmDbId("gdid2").build(),
                FaidareDocument.builder().withId("id3").withDescription("foobar 3").withEntryType("germplasm").withGermplasmDbId("gdid3").build(),
                FaidareDocument.builder().withId("id4").withDescription("foobar 4").withEntryType("other").withGermplasmDbId("gdid4").build(),
                FaidareDocument.builder().withId("id5").withDescription("other 5").withEntryType("germplasm").withGermplasmDbId("gdid5").build()
        ));
        documentDao.refresh();

        Set<String> ids = documentDao.findAllIds("foobar",
                false,
                SearchRefinements.builder()
                        .withTerm(FaidareAggregation.ENTRY_TYPE,
                                Collections.singletonList("germplasm"))
                        .build(), "germplasmDbId");
        assertThat(ids).containsOnly("gdid1", "gdid2", "gdid3");
    }

    @Nested
    class Aggregate {
        @BeforeEach
        void prepare() {
            FaidareDocument document1 =
                    FaidareDocument.builder()
                            .withId("r1")
                            .withEntryType("foo")
                            .withDatabaseName("Plantae")
                            .withNode("URGI")
                            .withSpecies(Arrays.asList("Vitis vinifera"))
                            .withAnnotationName(Arrays.asList("annot1", "annot2"))
                            .withHoldingInstitute("INRA")
                            .withBiologicalStatus("Natural")
                            .withGeneticNature("Nature1")
                            .withCountryOfOrigin("France")
                            .withTaxonGroup(Collections.singletonList("Pixies"))
                            .withObservationVariableIds(Collections.singletonList("OV1"))
                            .withGermplasmList(Collections.singletonList("GL1"))
                            .withGroupId(0)
                            .build();

            FaidareDocument document2 =
                    FaidareDocument.builder()
                            .withId("r2")
                            .withEntryType("bar foo")
                            .withDatabaseName("Fungi")
                            .withNode("URGI")
                            .withSpecies(Arrays.asList("Girolla mucha gusta"))
                            .withHoldingInstitute("University of Oulu")
                            .withBiologicalStatus("Traditional")
                            .withGeneticNature("Nature1")
                            .withCountryOfOrigin("Finland")
                            .withTaxonGroup(Collections.singletonList("Rolling stones"))
                            .withObservationVariableIds(Collections.singletonList("OV2"))
                            .withGermplasmList(Collections.singletonList("GL2"))
                            .withGroupId(1)
                            .build();

            when(mockCurrentUser.get()).thenReturn(new FaidareUser("john", new HashSet<>(Arrays.asList(0, 1))));

            documentDao.saveAll(Arrays.asList(document1, document2));
            documentDao.refresh();
        }

        @Test
        void shouldAggregate() {
            AggregatedPage<FaidareDocument> result =
                    documentDao.aggregate("foo", SearchRefinements.EMPTY, AggregationSelection.ALL, false);
            assertThat(result.getContent()).hasSize(1);

            AggregationTester databaseName = new AggregationTester(result.getAggregation(FaidareAggregation.DATABASE_NAME.getName()));
            assertThat(databaseName.getKeys()).containsOnly("Plantae", "Fungi");
            assertThat(databaseName.getDocumentCounts()).containsOnly(1L);

            AggregationTester entryType = new AggregationTester(result.getAggregation(FaidareAggregation.ENTRY_TYPE.getName()));
            assertThat(entryType.getKeys()).containsOnly("bar foo", "foo");
            assertThat(entryType.getDocumentCounts()).containsOnly(1L);

            AggregationTester node = new AggregationTester(result.getAggregation(FaidareAggregation.NODE.getName()));
            assertThat(node.getKeys()).containsExactly("URGI");
            assertThat(node.getDocumentCounts()).containsExactly(2L);

            AggregationTester species = new AggregationTester(result.getAggregation(FaidareAggregation.SPECIES.getName()));
            assertThat(species.getKeys()).containsOnly("Vitis vinifera", "Girolla mucha gusta");
            assertThat(species.getDocumentCounts()).containsOnly(1L);

            AggregationTester holdingInstitute = new AggregationTester(result.getAggregation(FaidareAggregation.HOLDING_INSTITUTE.getName()));
            assertThat(holdingInstitute.getKeys()).containsOnly("INRA", "University of Oulu");
            assertThat(holdingInstitute.getDocumentCounts()).containsOnly(1L);

            AggregationTester biologicalStatus = new AggregationTester(result.getAggregation(FaidareAggregation.BIOLOGICAL_STATUS.getName()));
            assertThat(biologicalStatus.getKeys()).containsOnly("Natural", "Traditional");
            assertThat(biologicalStatus.getDocumentCounts()).containsOnly(1L);

            AggregationTester geneticNature = new AggregationTester(result.getAggregation(FaidareAggregation.GENETIC_NATURE.getName()));
            assertThat(geneticNature.getKeys()).containsOnly("Nature1");
            assertThat(geneticNature.getDocumentCounts()).containsOnly(2L);

            AggregationTester countryOfOrigin = new AggregationTester(result.getAggregation(FaidareAggregation.COUNTRY_OF_ORIGIN.getName()));
            assertThat(countryOfOrigin.getKeys()).containsOnly("France", "Finland");
            assertThat(countryOfOrigin.getDocumentCounts()).containsOnly(1L);

            AggregationTester taxonGroup = new AggregationTester(result.getAggregation(FaidareAggregation.TAXON_GROUP.getName()));
            assertThat(taxonGroup.getKeys()).containsOnly("Pixies", "Rolling stones");
            assertThat(taxonGroup.getDocumentCounts()).containsOnly(1L);

            AggregationTester observationVariableIds = new AggregationTester(result.getAggregation(FaidareAggregation.ONTOLOGY.getName()));
            assertThat(observationVariableIds.getKeys()).containsOnly("OV1", "OV2");
            assertThat(observationVariableIds.getDocumentCounts()).containsOnly(1L);

            AggregationTester germplasmList = new AggregationTester(result.getAggregation(FaidareAggregation.GERMPLASM_LIST.getName()));
            assertThat(germplasmList.getKeys()).containsOnly("GL1", "GL2");
            assertThat(germplasmList.getDocumentCounts()).containsOnly(1L);
        }

        @Test
        void shouldAggregateWithMainAggregationsOnly() {
            AggregatedPage<FaidareDocument> result =
                    documentDao.aggregate("foo", SearchRefinements.EMPTY, AggregationSelection.MAIN, false);
            assertThat(result.getAggregations().stream().map(AggregationDTO::getName).collect(Collectors.toSet()))
                    .isEqualTo(FaidareAggregation.MAIN_AGGREGATIONS.stream().map(FaidareAggregation::getName).collect(Collectors.toSet()));
        }

        @Test
        void shouldAggregateWithBlankQuery() {
            AggregatedPage<FaidareDocument> result =
                    documentDao.aggregate("  ", SearchRefinements.EMPTY, AggregationSelection.ALL, false);
            assertThat(result.getAggregations()).hasSize(FaidareAggregation.values().length);
        }

        @Test
        void shouldHonorAccessibleGroupIds() {
            when(mockCurrentUser.get()).thenReturn(new FaidareUser("john", new HashSet<>(Arrays.asList(0))));
            AggregatedPage<FaidareDocument> result =
                documentDao.aggregate("  ", SearchRefinements.EMPTY, AggregationSelection.ALL, false);
            AggregationTester databaseName = new AggregationTester(result.getAggregation(FaidareAggregation.DATABASE_NAME.getName()));
            assertThat(databaseName.getKeys()).containsOnly("Plantae");
            assertThat(databaseName.getDocumentCounts()).containsOnly(1L);
        }
    }

    @Test
    void shouldAggregateEmptySpeciesAsNullValue() {
        shouldAggregateEmptyArrayAsNullValue(FaidareAggregation.SPECIES, FaidareDocument.Builder::withSpecies);
    }

    private void shouldAggregateEmptyArrayAsNullValue(FaidareAggregation faidareAggregation,
                                                      BiConsumer<FaidareDocument.Builder, List<String>> initializer) {
        FaidareDocument.Builder resource1Builder = FaidareDocument.builder()
                                                                  .withId("r1")
                                                                  .withEntryType("bar");
        initializer.accept(resource1Builder, Collections.singletonList("foo"));
        FaidareDocument document1 = resource1Builder.build();

        FaidareDocument document2 = FaidareDocument.builder()
                                                   .withId("r2")
                                                   .withEntryType("bar")
                                                   .build();

        documentDao.saveAll(Arrays.asList(document1, document2));
        documentDao.refresh();

        AggregatedPage<FaidareDocument> result =
            documentDao.aggregate("bar",  SearchRefinements.EMPTY, AggregationSelection.ALL, false);
        assertThat(result.getContent()).hasSize(1);

        AggregationTester aggregation = new AggregationTester(result.getAggregation(faidareAggregation.getName()));
        assertThat(aggregation.getKeys()).containsOnly("foo", FaidareDocument.NULL_VALUE);
        assertThat(aggregation.getDocumentCounts()).containsOnly(1L);
    }

    @Test
    void shouldFindPillars() {
        FaidareDocument resource1 = FaidareDocument.builder()
                                                   .withId("r1")
                                                   .withNode("P1")
                                                   .withDatabaseName("D11")
                                                   .build();

        FaidareDocument resource2 = FaidareDocument.builder()
                                                   .withId("r2")
                                                   .withNode("P1")
                                                   .withDatabaseName("D11")
                                                   .build();

        FaidareDocument resource3 = FaidareDocument.builder()
                                                   .withId("r3")
                                                   .withNode("P1")
                                                   .withDatabaseName("D12")
                                                   .build();

        FaidareDocument resource4 = FaidareDocument.builder()
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
        FaidareDocument resource1 =
            FaidareDocument.builder()
                           .withId("r1")
                           .withDescription("Here comes the sun, <p>tadadada</p>. It's alright.")
                           .build();


        FaidareDocument resource2 =
            FaidareDocument.builder()
                           .withId("r2")
                           .withEntryType("The sun.")
                           .withDescription("Imagine all the people")
                           .build();

        documentDao.saveAll(Arrays.asList(resource1, resource2));
        documentDao.refresh();

        AggregatedPage<FaidareDocument> result = documentDao.search("comes sun",
                                                                    true,
                                                                    false,
                                                                    SearchRefinements.EMPTY,
                                                                    firstPage);

        assertThat(result.getContent())
            .extracting(FaidareDocument::getDescription)
            .containsOnly("Here <em>comes</em> the <em>sun</em>, &lt;p&gt;tadadada&lt;&#x2F;p&gt;. It&#x27;s alright.",
                          "Imagine all the people");
    }

    @Test
    void shouldHighlightSynonymsInDescription() {
        FaidareDocument resource1 =
                FaidareDocument.builder()
                               .withId("r1")
                               .withDescription("wheat is good for your health, <p>or maybe not</p>, I don't know. In French, le blé est bon.")
                               .build();


        FaidareDocument resource2 =
                FaidareDocument.builder()
                               .withId("r2")
                               .withDescription("Triticum is very diverse and it includes diploid, tetraploid and hexaploid")
                               .build();

        documentDao.saveAll(Arrays.asList(resource1, resource2));
        documentDao.refresh();

        AggregatedPage<FaidareDocument> result = documentDao.search("blé",
                                                                    true,
                                                                    true,
                                                                    SearchRefinements.EMPTY,
                                                                    firstPage);

        assertThat(result.getContent())
                .extracting(FaidareDocument::getDescription)
                .containsOnly("<em>wheat</em> is good for your health, &lt;p&gt;or maybe not&lt;&#x2F;p&gt;, I don&#x27;t know. In French, le <em>blé</em> est bon.",
                        "<em>Triticum</em> is very diverse and it includes diploid, tetraploid and hexaploid");
    }

    @Nested
    @DisplayName("Test group for refinement / aggregations")
    class RefinementTest {
        @BeforeEach
        void prepare() {
            FaidareDocument document1 = FaidareDocument.builder()
                                                       .withId("r1")
                                                       .withNode("URGI")
                                                       .withDatabaseName("Evoltree")
                                                       .withEntryType("Marker")
                                                       .withSpecies(Collections.singletonList("Pinus banksiana"))
                                                       .withDescription("hello world")
                                                       .withAnnotationId(Collections.singletonList("GO:1234567"))
                                                       .withAnnotationName(Collections.singletonList("blah (GO:1234567)"))
                                                       .build();

            FaidareDocument document2 = FaidareDocument.builder()
                                                       .withId("r2")
                                                       .withNode("URGI")
                                                       .withDatabaseName("GnpIS")
                                                       .withEntryType("QTL")
                                                       .withSpecies(Collections.singletonList("Quercus robur"))
                                                       .withDescription("hello world")
                                                       .withAnnotationId(Collections.singletonList("GO:1234567"))
                                                       .withAnnotationName(Collections.singletonList("blah (GO:1234567)"))
                                                       .build();

            FaidareDocument document3 = FaidareDocument.builder()
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
                                 .withTerm(FaidareAggregation.ENTRY_TYPE, Arrays.asList("unexisting", "Marker"))
                                 .build();

            AggregatedPage<FaidareDocument> result =
                documentDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(FaidareDocument::getId).containsOnly("r1");

            refinements = SearchRefinements.builder()
                                           .withTerm(FaidareAggregation.DATABASE_NAME, Arrays.asList("unexisting", "GnpIS"))
                                           .build();
            result =
                documentDao.search("hello", false, false, refinements, firstPage);
            assertThat(result.getContent()).extracting(FaidareDocument::getId).containsOnly("r2", "r3");

            refinements = SearchRefinements.builder()
                                           .withTerm(FaidareAggregation.NODE, Arrays.asList("unexisting"))
                                           .build();
            result =
                documentDao.search("hello", false, false, refinements, firstPage);
            assertThat(result.getContent()).extracting(FaidareDocument::getId).isEmpty();
        }

        @Test
        void shouldApplyRefinementOnEmptySpecies() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(FaidareAggregation.SPECIES, Arrays.asList(SearchDocument.NULL_VALUE))
                                 .build();

            AggregatedPage<FaidareDocument> result =
                documentDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(FaidareDocument::getId).containsOnly("r3");
        }


        @Test
        void shouldApplyRefinementsOnAnnotationWithOrWithoutDescendants() {

            SearchRefinements refinements =
                    SearchRefinements.builder()
                            .withTerm(FaidareAggregation.GO_ANNOTATION, Arrays.asList("blah (GO:1234567)"))
                            .build();

            AggregatedPage<FaidareDocument> result =
                    documentDao.search("hello", false, false, refinements, firstPage);

            assertThat(result.getContent()).extracting(FaidareDocument::getId).containsOnly("r1", "r2");

            result =
                    documentDao.search("hello", false, true, refinements, firstPage);
            assertThat(result.getContent()).extracting(FaidareDocument::getId).containsOnly("r1", "r2", "r3");
        }

    }

}
