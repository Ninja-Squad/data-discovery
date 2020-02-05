package fr.inra.urgi.datadiscovery.dao.rare;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.TreeSet;
import java.util.function.BiConsumer;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.ElasticSearchConfig;
import fr.inra.urgi.datadiscovery.dao.DocumentDaoTest;
import fr.inra.urgi.datadiscovery.dao.DocumentIndexSettings;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.domain.Location;
import fr.inra.urgi.datadiscovery.domain.SuggestionDocument;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import org.assertj.core.util.Lists;
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
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;
import org.springframework.data.elasticsearch.core.mapping.ElasticsearchPersistentEntity;
import org.springframework.data.elasticsearch.core.query.AliasBuilder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@TestPropertySource("/test-rare.properties")
@Import(ElasticSearchConfig.class)
@JsonTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles(AppProfile.RARE)
class RareDocumentDaoTest extends DocumentDaoTest {

    private static final String PHYSICAL_INDEX = "test-rare-resource-physical-index";
    private static final String SUGGESTION_INDEX = "test-rare-suggestions";

    @Autowired
    private RareDocumentDao documentDao;

    private Pageable firstPage = PageRequest.of(0, 10);

    @BeforeAll
    void prepareIndex() {
        ElasticsearchPersistentEntity documentEntity = elasticsearchTemplate.getPersistentEntityFor(
                RareDocument.class);
        ElasticsearchPersistentEntity suggestionDocumentEntity = elasticsearchTemplate.getPersistentEntityFor(
                SuggestionDocument.class);
        elasticsearchTemplate.deleteIndex(PHYSICAL_INDEX);
        elasticsearchTemplate.createIndex(PHYSICAL_INDEX, DocumentIndexSettings.createSettings(AppProfile.RARE));
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
        elasticsearchTemplate.putMapping(RareDocument.class);
        elasticsearchTemplate.putMapping(SuggestionDocument.class);
    }

    @BeforeEach
    void prepare() {
        documentDao.deleteAll();
        documentDao.deleteAllSuggestions();
    }

    @Test
    void shouldSaveAndGet() {

        RareDocument document =
            RareDocument.builder()
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

        documentDao.saveAll(Collections.singleton(document));
        documentDao.refresh();
//        assertThat(documentDao.findById(document.getId()).get()).isEqualTo(document);
    }

    @Test
    void shouldSearchOnName() {
        shouldSearch(RareDocument.Builder::withName);
    }

    @Test
    void shouldSearchOnDescription() {
        shouldSearch(RareDocument.Builder::withDescription);
    }

    @Test
    void shouldSearchOnPillarName() {
        shouldSearch(RareDocument.Builder::withPillarName);
    }

    @Test
    void shouldSearchOnDatabaseSource() {
        shouldSearch(RareDocument.Builder::withDatabaseSource);
    }

    @Test
    void shouldSearchOnDomain() {
        shouldSearch(RareDocument.Builder::withDomain);
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
        shouldSearch(RareDocument.Builder::withCountryOfOrigin);
    }

    @Test
    void shouldSearchOnCountryOfCollect() {
        shouldSearch(RareDocument.Builder::withCountryOfCollect);
    }

    @Test
    void shouldNotSearchOnIdentifier() {
        RareDocument document = RareDocument.builder().withId("foo-bar").build();
        documentDao.save(document);

        assertThat(documentDao.search(document.getId(),
                false,
                                             SearchRefinements.EMPTY,
                                             firstPage).getContent()).isEmpty();
    }

    @Test
    void shouldNotSearchOnUrls() {
        RareDocument document =
            RareDocument.builder().withDataURL("foo bar baz").withPortalURL("foo bar baz").build();
        documentDao.save(document);

        assertThat(documentDao.search("bar",
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

    @Test
    void shouldSuggestSeveralResults() {
        SuggestionDocument s1 = SuggestionDocument.builder().withSuggestion("vita e bella").build();
        SuggestionDocument s2 = SuggestionDocument.builder().withSuggestion("vitis vinifera").build();
        documentDao.saveAllSuggestions(Arrays.asList(s1, s2));

        List<String> result = documentDao.suggest("vit");
        assertThat(result).containsOnly("vitis vinifera", "vita e bella");

        result = documentDao.suggest("vitis v");
        assertThat(result).containsOnly("vitis vinifera");
    }

    @Test
    void shouldRemoveCaseDifferingResults() {
        SuggestionDocument resource = SuggestionDocument.builder().withSuggestion("vita").build();
        SuggestionDocument resource2 = SuggestionDocument.builder().withSuggestion("vitis").build();
        SuggestionDocument resource3 = SuggestionDocument.builder().withSuggestion("VITIS").build();

        documentDao.saveAllSuggestions(Arrays.asList(resource, resource2, resource3));

        List<String> result = documentDao.suggest("vit");
        assertThat(result).hasSize(2);

        TreeSet<String> ignoringCaseSet = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        ignoringCaseSet.addAll(result);
        assertThat(ignoringCaseSet).hasSize(2);
    }

    @Test
    void shouldNotFailSuggestingIfNoData() {
        assertThat(documentDao.suggest("vitis")).isEmpty();
    }

    private void shouldSearch(BiConsumer<RareDocument.Builder, String> config) {
        RareDocument.Builder documentBuilder = RareDocument.builder();
        config.accept(documentBuilder, "foo bar baz");
        RareDocument document = documentBuilder.build();

        documentDao.saveAll(Collections.singleton(document));
        documentDao.refresh();

        AggregatedPage<RareDocument> result =
            documentDao.search("bar", false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getAggregations()).isNull();

        result = documentDao.search("bing", false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void shouldAggregate() {
        RareDocument document1 = RareDocument.builder()
                                                                  .withId("r1")
                                                                  .withName("foo")
                                                                  .withDomain("Plantae")
                                                                  .withBiotopeType(Arrays.asList("Biotope", "Human host"))
                                                                  .withMaterialType(Arrays.asList("Specimen", "DNA"))
                                                                  .withCountryOfOrigin("France")
                                                                  .withCountryOfCollect("Belgium")
                                                                  .withTaxon(Arrays.asList("Vitis vinifera"))
                                                                  .build();

        RareDocument document2 = RareDocument.builder()
                                                                  .withId("r2")
                                                                  .withName("bar foo")
                                                                  .withDomain("Fungi")
                                                                  .withBiotopeType(Arrays.asList("Biotope"))
                                                                  .withMaterialType(Arrays.asList("DNA"))
                                                                  .withCountryOfOrigin("France")
                                                                  .withCountryOfCollect("Belgium")
                                                                  .withTaxon(Arrays.asList("Girolla mucha gusta"))
                                                                  .build();

        documentDao.saveAll(Arrays.asList(document1, document2));
        documentDao.refresh();

        AggregatedPage<RareDocument> result =
            documentDao.aggregate("foo", SearchRefinements.EMPTY);
        assertThat(result.getContent()).hasSize(1);

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
        shouldAggregateNullValue(RareAggregation.COUNTRY_OF_ORIGIN, RareDocument.Builder::withCountryOfOrigin);
    }

    @Test
    void shouldAggregateNullCountryOfCollectValueAsNullValue() {
        shouldAggregateNullValue(RareAggregation.COUNTRY_OF_COLLECT, RareDocument.Builder::withCountryOfCollect);
    }

    @Test
    void shouldAggregateEmptyMaterialTypeAsNullValue() {
        shouldAggregateEmptyArrayAsNullValue(RareAggregation.MATERIAL,
                                             RareDocument.Builder::withMaterialType);
    }

    @Test
    void shouldAggregateEmptyBiotopeTypeAsNullValue() {
        shouldAggregateEmptyArrayAsNullValue(RareAggregation.BIOTOPE,
                                             RareDocument.Builder::withBiotopeType);
    }

    private void shouldAggregateNullValue(RareAggregation rareAggregation,
                                          BiConsumer<RareDocument.Builder, String> initializer) {
        RareDocument.Builder resource1Builder = RareDocument.builder()
                                                                          .withId("r1")
                                                                          .withName("vitis 1");
        initializer.accept(resource1Builder, "foo");
        RareDocument document1 = resource1Builder.build();

        RareDocument document2 = RareDocument.builder()
                                                                  .withId("r2")
                                                                  .withName("vitis 2")
                                                                  .build();

        documentDao.saveAll(Arrays.asList(document1, document2));
        documentDao.refresh();

        AggregatedPage<RareDocument> result =
            documentDao.aggregate("vitis", SearchRefinements.EMPTY);
        assertThat(result.getContent()).hasSize(1);

        Terms material = result.getAggregations().get(rareAggregation.getName());
        assertThat(material.getName()).isEqualTo(rareAggregation.getName());
        assertThat(material.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("foo", RareDocument.NULL_VALUE);
        assertThat(material.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
    }

    private void shouldAggregateEmptyArrayAsNullValue(RareAggregation rareAggregation,
                                                      BiConsumer<RareDocument.Builder, List<String>> initializer) {
        RareDocument.Builder resource1Builder = RareDocument.builder()
                                                                          .withId("r1")
                                                                          .withName("vitis 1");
        initializer.accept(resource1Builder, Collections.singletonList("foo"));
        RareDocument document1 = resource1Builder.build();

        RareDocument document2 = RareDocument.builder()
                                                                  .withId("r2")
                                                                  .withName("vitis 2")
                                                                  .build();

        documentDao.saveAll(Arrays.asList(document1, document2));
        documentDao.refresh();

        AggregatedPage<RareDocument> result =
            documentDao.aggregate("vitis",SearchRefinements.EMPTY);
        assertThat(result.getContent()).hasSize(1);

        Terms material = result.getAggregations().get(rareAggregation.getName());
        assertThat(material.getName()).isEqualTo(rareAggregation.getName());
        assertThat(material.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("foo", RareDocument.NULL_VALUE);
        assertThat(material.getBuckets()).extracting(Bucket::getDocCount).containsOnly(1L);
    }

    @Test
    void shouldFindPillars() {
        RareDocument resource1 = RareDocument.builder()
                                                           .withId("r1")
                                                           .withPillarName("P1")
                                                           .withDatabaseSource("D11")
                                                           .withPortalURL("D11Url")
                                                           .build();

        RareDocument resource2 = RareDocument.builder()
                                                           .withId("r2")
                                                           .withPillarName("P1")
                                                           .withDatabaseSource("D11")
                                                           .withPortalURL("D11Url")
                                                           .build();

        RareDocument resource3 = RareDocument.builder()
                                                           .withId("r3")
                                                           .withPillarName("P1")
                                                           .withDatabaseSource("D12")
                                                           .withPortalURL("D12Url")
                                                           .build();

        RareDocument resource4 = RareDocument.builder()
                                                           .withId("r4")
                                                           .withPillarName("P2")
                                                           .withDatabaseSource("D21")
                                                           .withPortalURL("D21Url")
                                                           .build();

        RareDocument resource5 = RareDocument.builder()
                                                           .withId("r5")
                                                           .withPillarName("P2")
                                                           .withDatabaseSource("D22")
                                                           .build();

        documentDao.saveAll(Arrays.asList(resource1, resource2, resource3, resource4, resource5));
        documentDao.refresh();

        Terms pillars = documentDao.findPillars();

        assertThat(pillars.getBuckets()).hasSize(2);

        Bucket p1 = pillars.getBucketByKey("P1");

        Terms databaseSource = p1.getAggregations().get(RareDocumentDao.DATABASE_SOURCE_AGGREGATION_NAME);
        assertThat(databaseSource.getBuckets()).hasSize(2);

        Bucket d11 = databaseSource.getBucketByKey("D11");
        assertThat(d11.getDocCount()).isEqualTo(2);
        Terms d11Url = d11.getAggregations().get(RareDocumentDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d11Url.getBuckets()).hasSize(1);
        assertThat(d11Url.getBuckets().get(0).getKeyAsString()).isEqualTo("D11Url");

        Bucket d12 = databaseSource.getBucketByKey("D12");
        assertThat(d12.getDocCount()).isEqualTo(1);
        Terms d12Url = d12.getAggregations().get(RareDocumentDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d12Url.getBuckets()).hasSize(1);
        assertThat(d12Url.getBuckets().get(0).getKeyAsString()).isEqualTo("D12Url");

        Bucket p2 = pillars.getBucketByKey("P2");

        databaseSource = p2.getAggregations().get(RareDocumentDao.DATABASE_SOURCE_AGGREGATION_NAME);
        assertThat(databaseSource.getBuckets()).hasSize(2);

        Bucket d21 = databaseSource.getBucketByKey("D21");
        assertThat(d21.getDocCount()).isEqualTo(1);
        Terms d21Url = d21.getAggregations().get(RareDocumentDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d21Url.getBuckets()).hasSize(1);
        assertThat(d21Url.getBuckets().get(0).getKeyAsString()).isEqualTo("D21Url");

        Bucket d22 = databaseSource.getBucketByKey("D22");
        assertThat(d22.getDocCount()).isEqualTo(1);
        Terms d22Url = d22.getAggregations().get(RareDocumentDao.PORTAL_URL_AGGREGATION_NAME);
        assertThat(d22Url.getBuckets()).isEmpty();
    }

    @Test
    void shouldHighlightDescription() {
        RareDocument resource1 =
            RareDocument.builder()
                               .withId("r1")
                               .withDescription("Here comes the sun, <p>tadadada</p>. It's alright.")
                               .build();


        RareDocument resource2 =
            RareDocument.builder()
                               .withId("r2")
                               .withName("The sun.")
                               .withDescription("Imagine all the people")
                               .build();

        documentDao.saveAll(Arrays.asList(resource1, resource2));
        documentDao.refresh();

        AggregatedPage<RareDocument> result = documentDao.search("comes sun",
                true,
                                                                               SearchRefinements.EMPTY,
                                                                               firstPage);

        assertThat(result.getContent())
            .extracting(RareDocument::getDescription)
            .containsOnly("Here <em>comes</em> the <em>sun</em>, &lt;p&gt;tadadada&lt;&#x2F;p&gt;. It&#x27;s alright.",
                          "Imagine all the people");
    }

    @Nested
    class RefinementTest {
        @BeforeEach
        void prepare() {
            RareDocument document1 = RareDocument.builder()
                                                                      .withId("r1")
                                                                      .withName("foo")
                                                                      .withDomain("Plantae")
                                                                      .withBiotopeType(Arrays.asList("Biotope", "Human host"))
                                                                      .withMaterialType(Arrays.asList("Specimen", "DNA"))
                                                                      .withCountryOfOrigin("France")
                                                                      .withDescription("hello world")
                                                                      .build();

            RareDocument document2 = RareDocument.builder()
                                                                      .withId("r2")
                                                                      .withName("bar foo")
                                                                      .withDomain("Fungi")
                                                                      .withBiotopeType(Arrays.asList("Biotope"))
                                                                      .withMaterialType(Arrays.asList("DNA"))
                                                                      .withCountryOfOrigin(null)
                                                                      .withDescription("hello world")
                                                                      .build();

            RareDocument document3 = RareDocument.builder()
                                                                      .withId("r3")
                                                                      .withName("ding")
                                                                      .withDomain("Plantae")
                                                                      .withBiotopeType(Collections.emptyList())
                                                                      .withMaterialType(Collections.emptyList())
                                                                      .withCountryOfOrigin("France")
                                                                      .withDescription("hello world")
                                                                      .build();

            documentDao.saveAll(Arrays.asList(document1, document2, document3));
            documentDao.refresh();
        }

        @Test
        void shouldApplyRefinementsOnSingleTermWithOr() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Plantae"))
                                 .build();

            AggregatedPage<RareDocument> result =
                documentDao.search("hello", false, refinements, firstPage);

            assertThat(result.getContent()).extracting(RareDocument::getId).containsOnly("r1", "r3");

            refinements = SearchRefinements.builder()
                                           .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Fungi"))
                                           .build();
            result =
                documentDao.search("hello", false, refinements, firstPage);
            assertThat(result.getContent()).extracting(RareDocument::getId).containsOnly("r2");

            refinements = SearchRefinements.builder()
                                           .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting"))
                                           .build();
            result =
                documentDao.search("hello", false, refinements, firstPage);
            assertThat(result.getContent()).extracting(RareDocument::getId).isEmpty();
        }

        @Test
        void shouldApplyRefinementOnNullValue() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.COUNTRY_OF_ORIGIN, Arrays.asList(RareDocument.NULL_VALUE))
                                 .build();

            AggregatedPage<RareDocument> result =
                documentDao.search("hello", false, refinements, firstPage);

            assertThat(result.getContent()).extracting(RareDocument::getId).containsOnly("r2");
        }

        @Test
        void shouldApplyRefinementOnEmptyBiotopeType() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.BIOTOPE, Arrays.asList(RareDocument.NULL_VALUE))
                                 .build();

            AggregatedPage<RareDocument> result =
                documentDao.search("hello", false, refinements, firstPage);

            assertThat(result.getContent()).extracting(RareDocument::getId).containsOnly("r3");
        }

        @Test
        void shouldApplyRefinementOnEmptyMaterialType() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.MATERIAL, Arrays.asList(RareDocument.NULL_VALUE))
                                 .build();

            AggregatedPage<RareDocument> result =
                documentDao.search("hello", false, refinements, firstPage);

            assertThat(result.getContent()).extracting(RareDocument::getId).containsOnly("r3");
        }

        @Test
        void shouldApplyRefinementsOnMultipleTermsWithAnd() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Fungi"))
                                 .withTerm(RareAggregation.BIOTOPE, Arrays.asList("unexisting", "Biotope"))
                                 .build();

            AggregatedPage<RareDocument> result =
                documentDao.search("hello", false, refinements, firstPage);

            assertThat(result.getContent()).extracting(RareDocument::getId).containsOnly("r2");

            refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("unexisting", "Fungi"))
                                 .withTerm(RareAggregation.BIOTOPE, Arrays.asList("Human host"))
                                 .build();

            result =
                documentDao.search("hello", false, refinements, firstPage);
            assertThat(result.getContent()).isEmpty();
        }

        @Test
        void shouldRestrainAggregationsBasedOnOtherRefinements() {
            SearchRefinements refinements =
                SearchRefinements.builder()
                                 .withTerm(RareAggregation.DOMAIN, Arrays.asList("Plantae"))
                                 .build();

            AggregatedPage<RareDocument> result =
                documentDao.aggregate("hello", refinements);

            Terms domain = result.getAggregations().get(RareAggregation.DOMAIN.getName());
            assertThat(domain.getBuckets()).hasSize(2);
            assertThat(domain.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Plantae", "Fungi");
            assertThat(domain.getBuckets()).extracting(Bucket::getDocCount).containsOnly(2L, 1L);

            // NULL is not in the aggregation because r2 is not in the result due to the refinement on Plantae
            Terms countryOfOrigin = result.getAggregations().get(RareAggregation.COUNTRY_OF_ORIGIN.getName());
            assertThat(countryOfOrigin.getBuckets()).hasSize(1);
            assertThat(countryOfOrigin.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("France");
            assertThat(countryOfOrigin.getBuckets()).extracting(Bucket::getDocCount).containsOnly(2L);
        }
    }
}
