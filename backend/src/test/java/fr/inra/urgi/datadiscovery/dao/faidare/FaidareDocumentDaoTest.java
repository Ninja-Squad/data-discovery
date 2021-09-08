package fr.inra.urgi.datadiscovery.dao.faidare;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.ElasticSearchConfig;
import fr.inra.urgi.datadiscovery.dao.AggregationSelection;
import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import fr.inra.urgi.datadiscovery.dao.DocumentDaoTest;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.domain.AggregatedPage;
import fr.inra.urgi.datadiscovery.domain.SearchDocument;
import fr.inra.urgi.datadiscovery.domain.SuggestionDocument;
import fr.inra.urgi.datadiscovery.domain.faidare.FaidareDocument;
import org.assertj.core.util.Lists;
import org.elasticsearch.search.aggregations.Aggregation;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms.Bucket;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource("/test-faidare.properties")
@Import(ElasticSearchConfig.class)
@JsonTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles(AppProfile.FAIDARE)
class FaidareDocumentDaoTest extends DocumentDaoTest {

    private static final String PHYSICAL_INDEX = "test-faidare-resource-physical-index";
    private static final String SUGGESTION_INDEX = "test-faidare-suggestions";

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
        assertThat(result.getAggregations()).isNull();

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
    void shouldFindAllIds() {
        documentDao.saveAll(Arrays.asList(
            FaidareDocument.builder().withId("id1").withDescription("foobar 1").withEntryType("germplasm").build(),
            FaidareDocument.builder().withId("id2").withDescription("foobar 2").withEntryType("germplasm").build(),
            FaidareDocument.builder().withId("id3").withDescription("foobar 3").withEntryType("germplasm").build(),
            FaidareDocument.builder().withId("id4").withDescription("foobar 4").withEntryType("other").build(),
            FaidareDocument.builder().withId("id5").withDescription("other 5").withEntryType("germplasm").build()
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
                            .build();

            documentDao.saveAll(Arrays.asList(document1, document2));
            documentDao.refresh();
        }

        @Test
        void shouldAggregate() {
            AggregatedPage<FaidareDocument> result =
                    documentDao.aggregate("foo", SearchRefinements.EMPTY, AggregationSelection.ALL, false);
            assertThat(result.getContent()).hasSize(1);

            Terms databaseName = result.getAggregations().get(FaidareAggregation.DATABASE_NAME.getName());
            assertThat(databaseName.getName()).isEqualTo(FaidareAggregation.DATABASE_NAME.getName());
            assertThat(databaseName.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Plantae", "Fungi");
            assertThat(databaseName.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);

            Terms entryType = result.getAggregations().get(FaidareAggregation.ENTRY_TYPE.getName());
            assertThat(entryType.getName()).isEqualTo(FaidareAggregation.ENTRY_TYPE.getName());
            assertThat(entryType.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("bar foo", "foo");
            assertThat(entryType.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);

            Terms node = result.getAggregations().get(FaidareAggregation.NODE.getName());
            assertThat(node.getName()).isEqualTo(FaidareAggregation.NODE.getName());
            assertThat(node.getBuckets()).extracting(Bucket::getKeyAsString).containsExactly("URGI");
            assertThat(node.getBuckets()).extracting(Bucket::getDocCount).containsExactly(2L);

            Terms species = result.getAggregations().get(FaidareAggregation.SPECIES.getName());
            assertThat(species.getName()).isEqualTo(FaidareAggregation.SPECIES.getName());
            assertThat(species.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Vitis vinifera", "Girolla mucha gusta");
            assertThat(species.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);

            Terms holdingInstitute = result.getAggregations().get(FaidareAggregation.HOLDING_INSTITUTE.getName());
            assertThat(holdingInstitute.getName()).isEqualTo(FaidareAggregation.HOLDING_INSTITUTE.getName());
            assertThat(holdingInstitute.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("INRA", "University of Oulu");
            assertThat(holdingInstitute.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);

            Terms biologicalStatus = result.getAggregations().get(FaidareAggregation.BIOLOGICAL_STATUS.getName());
            assertThat(biologicalStatus.getName()).isEqualTo(FaidareAggregation.BIOLOGICAL_STATUS.getName());
            assertThat(biologicalStatus.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Natural", "Traditional");
            assertThat(biologicalStatus.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);

            Terms geneticNature = result.getAggregations().get(FaidareAggregation.GENETIC_NATURE.getName());
            assertThat(geneticNature.getName()).isEqualTo(FaidareAggregation.GENETIC_NATURE.getName());
            assertThat(geneticNature.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Nature1");
            assertThat(geneticNature.getBuckets()).extracting(Bucket::getDocCount).containsOnly(2L);

            Terms countryOfOrigin = result.getAggregations().get(FaidareAggregation.COUNTRY_OF_ORIGIN.getName());
            assertThat(countryOfOrigin.getName()).isEqualTo(FaidareAggregation.COUNTRY_OF_ORIGIN.getName());
            assertThat(countryOfOrigin.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("France", "Finland");
            assertThat(countryOfOrigin.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);

            Terms taxonGroup = result.getAggregations().get(FaidareAggregation.TAXON_GROUP.getName());
            assertThat(taxonGroup.getName()).isEqualTo(FaidareAggregation.TAXON_GROUP.getName());
            assertThat(taxonGroup.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Pixies", "Rolling stones");
            assertThat(taxonGroup.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);

            Terms observationVariableIds = result.getAggregations().get(FaidareAggregation.ONTOLOGY.getName());
            assertThat(observationVariableIds.getName()).isEqualTo(FaidareAggregation.ONTOLOGY.getName());
            assertThat(observationVariableIds.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("OV1", "OV2");
            assertThat(observationVariableIds.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
        }

        @Test
        void shouldAggregateWithMainAggregationsOnly() {
            AggregatedPage<FaidareDocument> result =
                    documentDao.aggregate("foo", SearchRefinements.EMPTY, AggregationSelection.MAIN, false);
            assertThat(result.getAggregations().asList().stream().map(Aggregation::getName).collect(Collectors.toSet()))
                    .isEqualTo(FaidareAggregation.MAIN_AGGREGATIONS.stream().map(FaidareAggregation::getName).collect(Collectors.toSet()));
        }

        @Test
        void shouldAggregateWithBlankQuery() {
            AggregatedPage<FaidareDocument> result =
                    documentDao.aggregate("  ", SearchRefinements.EMPTY, AggregationSelection.ALL, false);
            assertThat(result.getAggregations()).hasSize(FaidareAggregation.values().length);
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

        Terms aggregation = result.getAggregations().get(faidareAggregation.getName());
        assertThat(aggregation.getName()).isEqualTo(faidareAggregation.getName());
        assertThat(aggregation.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("foo", FaidareDocument.NULL_VALUE);
        assertThat(aggregation.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
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
        Terms d12Url = d12.getAggregations().get(FaidareDocumentDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d12Url).isNull();

        Bucket p2 = pillars.getBucketByKey("P2");

        databaseSource = p2.getAggregations().get(FaidareDocumentDao.DATABASE_SOURCE_AGGREGATION_NAME);
        assertThat(databaseSource.getBuckets()).hasSize(1);

        Bucket d21 = databaseSource.getBucketByKey("D21");
        assertThat(d21.getDocCount()).isEqualTo(1);
        Terms d21Url = d21.getAggregations().get(FaidareDocumentDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d21Url).isNull();
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
