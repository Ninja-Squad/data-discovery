package fr.inra.urgi.datadiscovery.dao.rare;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.List;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.config.ElasticSearchConfig;
import fr.inra.urgi.datadiscovery.dao.AggregationSelection;
import fr.inra.urgi.datadiscovery.dao.AggregationTester;
import fr.inra.urgi.datadiscovery.dao.DocumentDaoTest;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.domain.AggregatedPage;
import fr.inra.urgi.datadiscovery.domain.rare.RareDocument;
import fr.inra.urgi.datadiscovery.pillar.PillarDTO;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.elasticsearch.test.autoconfigure.DataElasticsearchTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(
    value = "/test-rare.properties",
    properties = {
        "rare.implicit-terms.PILLAR=plantes,organismes"
    }
)
@Import(ElasticSearchConfig.class)
@DataElasticsearchTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles({AppProfile.RARE, AppProfile.BRC4ENV})
class RareDocumentDaoWithImplicitTermsTest extends DocumentDaoTest {

    private static final String PHYSICAL_INDEX = "test-rare-resource-physical-index";

    @Autowired
    private RareDocumentDao documentDao;

    private final Pageable firstPage = PageRequest.of(0, 10);

    @BeforeAll
    void prepareIndex() {
        deleteIndex(PHYSICAL_INDEX);
        createDocumentIndex(PHYSICAL_INDEX, AppProfile.RARE);
        createAlias(PHYSICAL_INDEX, RareDocument.class);
        putMapping(RareDocument.class);
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
            documentDao.search("bar", false, false, SearchRefinements.EMPTY, firstPage);
        assertThat(result.getContent()).hasSize(2);

        result = documentDao.search("bing", false, false, SearchRefinements.EMPTY, firstPage);
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
            documentDao.aggregate("foo", SearchRefinements.EMPTY, AggregationSelection.ALL, false);
        assertThat(result.getContent()).hasSize(1);

        AggregationTester domain = new AggregationTester(result.getAggregation(RareAggregation.DOMAIN.getName()));
        assertThat(domain.getKeys()).containsOnly("Plantae", "Organismae");
        assertThat(domain.getDocumentCounts()).containsOnly(1L);

        AggregationTester biotopeType = new AggregationTester(result.getAggregation(RareAggregation.BIOTOPE.getName()));
        assertThat(biotopeType.getKeys()).containsExactly("Biotope", "Human host");
        assertThat(biotopeType.getDocumentCounts()).containsExactly(2L, 1L);
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

        List<PillarDTO> pillars = documentDao.findPillars();

        assertThat(pillars).hasSize(1);
        assertThat(pillars.get(0).getName()).isEqualTo("plantes");
    }
}
