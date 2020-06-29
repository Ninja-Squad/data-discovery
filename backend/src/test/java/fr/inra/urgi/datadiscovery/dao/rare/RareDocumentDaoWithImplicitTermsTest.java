package fr.inra.urgi.datadiscovery.dao.rare;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.ElasticSearchConfig;
import fr.inra.urgi.datadiscovery.dao.DocumentDaoTest;
import fr.inra.urgi.datadiscovery.dao.DocumentIndexSettings;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms.Bucket;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
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

@ExtendWith(SpringExtension.class)
@TestPropertySource(
    value = "/test-rare.properties",
    properties = {
        "rare.implicit-terms.PILLAR=plantes,organismes"
    }
)
@Import(ElasticSearchConfig.class)
@JsonTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles({AppProfile.RARE, AppProfile.RARE_WITH_BASKET})
class RareDocumentDaoWithImplicitTermsTest extends DocumentDaoTest {

    private static final String PHYSICAL_INDEX = "test-rare-resource-physical-index";

    @Autowired
    private RareDocumentDao documentDao;

    private final Pageable firstPage = PageRequest.of(0, 10);

    @BeforeAll
    void prepareIndex() {
        ElasticsearchPersistentEntity documentEntity =
            elasticsearchTemplate.getPersistentEntityFor(RareDocument.class);
        elasticsearchTemplate.deleteIndex(PHYSICAL_INDEX);
        elasticsearchTemplate.createIndex(PHYSICAL_INDEX, DocumentIndexSettings.createSettings(AppProfile.RARE));
        elasticsearchTemplate.addAlias(
            new AliasBuilder().withAliasName(documentEntity.getIndexName())
                              .withIndexName(PHYSICAL_INDEX)
                              .build()
        );
        elasticsearchTemplate.putMapping(RareDocument.class);
    }

    @BeforeEach
    void prepare() {
        documentDao.deleteAll();
    }

    @Test
    void shouldSearchWithImplicitPillars() {
        RareDocument acceptedDocument1 =
            RareDocument.builder()
                        .withName("foo bar baz")
                        .withPillarName("plantes")
                        .build();

        RareDocument acceptedDocument2 =
            RareDocument.builder()
                        .withName("foo bar baz")
                        .withPillarName("organismes")
                        .build();

        RareDocument rejectedDocument =
            RareDocument.builder()
                        .withName("foo bar baz")
                        .withPillarName("champignons")
                        .build();
        documentDao.saveAll(Arrays.asList(acceptedDocument1, acceptedDocument2, rejectedDocument));
        documentDao.refresh();

        AggregatedPage<RareDocument> result =
            documentDao.search("bar", false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(2);

        result = documentDao.search("bing", false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void shouldAggregateWithImplicitPillars() {
        RareDocument document1 = RareDocument.builder()
                                             .withId("r1")
                                             .withName("foo")
                                             .withDomain("Plantae")
                                             .withBiotopeType(Arrays.asList("Biotope", "Human host"))
                                             .withMaterialType(Arrays.asList("Specimen", "DNA"))
                                             .withCountryOfOrigin("France")
                                             .withCountryOfCollect("Belgium")
                                             .withTaxon(Arrays.asList("Vitis vinifera"))
                                             .withPillarName("plantes")
                                             .build();

        RareDocument document2 = RareDocument.builder()
                                             .withId("r2")
                                             .withName("bar foo")
                                             .withDomain("Organismae")
                                             .withBiotopeType(Arrays.asList("Biotope"))
                                             .withMaterialType(Arrays.asList("DNA"))
                                             .withCountryOfOrigin("France")
                                             .withCountryOfCollect("Belgium")
                                             .withTaxon(Arrays.asList("Girolla mucha gusta"))
                                             .withPillarName("organismes")
                                             .build();

        RareDocument document3 = RareDocument.builder()
                                             .withId("r3")
                                             .withName("bar foo")
                                             .withDomain("Fungi")
                                             .withBiotopeType(Arrays.asList("Biotope"))
                                             .withMaterialType(Arrays.asList("DNA"))
                                             .withCountryOfOrigin("France")
                                             .withCountryOfCollect("Belgium")
                                             .withTaxon(Arrays.asList("Girolla mucha gusta"))
                                             .withPillarName("champignons")
                                             .build();

        documentDao.saveAll(Arrays.asList(document1, document2, document3));
        documentDao.refresh();

        AggregatedPage<RareDocument> result =
            documentDao.aggregate("foo", SearchRefinements.EMPTY);
        assertThat(result.getContent()).hasSize(1);

        Terms domain = result.getAggregations().get(RareAggregation.DOMAIN.getName());
        assertThat(domain.getName()).isEqualTo(RareAggregation.DOMAIN.getName());
        assertThat(domain.getBuckets()).extracting(Bucket::getKeyAsString).containsOnly("Plantae", "Organismae");
        assertThat(domain.getBuckets()).extracting(Terms.Bucket::getDocCount).containsOnly(1L);

        Terms biotopeType = result.getAggregations().get(RareAggregation.BIOTOPE.getName());
        assertThat(biotopeType.getName()).isEqualTo(RareAggregation.BIOTOPE.getName());
        assertThat(biotopeType.getBuckets()).extracting(Bucket::getKeyAsString).containsExactly("Biotope", "Human host");
        assertThat(biotopeType.getBuckets()).extracting(Bucket::getDocCount).containsExactly(2L, 1L);
    }

    @Test
    void shouldFindPillarsWithImplicitPillars() {
        RareDocument resource1 = RareDocument.builder()
                                             .withId("r1")
                                             .withPillarName("plantes")
                                             .withDatabaseSource("D11")
                                             .withPortalURL("D11Url")
                                             .build();

        RareDocument resource2 = RareDocument.builder()
                                             .withId("r2")
                                             .withPillarName("champignons")
                                             .withDatabaseSource("D21")
                                             .withPortalURL("D21Url")
                                             .build();

        documentDao.saveAll(Arrays.asList(resource1, resource2));
        documentDao.refresh();

        Terms pillars = documentDao.findPillars();

        assertThat(pillars.getBuckets()).hasSize(1);
        assertThat(pillars.getBuckets().get(0).getKeyAsString()).isEqualTo("plantes");
    }
}
