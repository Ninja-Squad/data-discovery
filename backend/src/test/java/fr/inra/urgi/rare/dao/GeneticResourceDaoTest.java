package fr.inra.urgi.rare.dao;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.Collections;
import java.util.function.BiConsumer;

import fr.inra.urgi.rare.config.ElasticSearchConfig;
import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.domain.GeneticResourceBuilder;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms.Bucket;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.aggregation.AggregatedPage;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@TestPropertySource("/test.properties")
@Import(ElasticSearchConfig.class)
@JsonTest
class GeneticResourceDaoTest {

    @Autowired
    private GeneticResourceDao geneticResourceDao;

    private Pageable firstPage = PageRequest.of(0, 10);

    @BeforeEach
    void prepare() {
        geneticResourceDao.deleteAll();
    }

    @Test
    void shouldSaveAndGet() {

        GeneticResource geneticResource =
                new GeneticResource(
                        "doi:10.15454/1.492178535151698E12",
                        "Grecanico dorato",
                        "Grecanico dorato is a Vitis vinifera subsp vinifera cv. Garganega accession (number: "
                                + "1310Mtp1, doi:10.15454/1.492178535151698E12) maintained by the GRAPEVINE (managed by INRA) and held "
                                + "by INRA. It is a maintained/maintenu accession of biological status traditional cultivar/cultivar "
                                + "traditionnel",
                        "Plant",
                        "Florilège",
                        "http://florilege.arcad-project.org/fr/collections",
                        "https://urgi.versailles.inra.fr/gnpis-core/#accessionCard/id=ZG9pOjEwLjE1NDU0LzEuNDkyMTc4NTM1MTUxNjk4RTEy",
                        "Plantae",
                        Collections.singletonList("Vitis vinifera"),
                        Collections.singletonList("Vitaceae"),
                        Collections.singletonList("Vitis"),
                        Collections.singletonList("Vitis vinifera"),
                        Collections.singletonList("testMaterialType"),
                        Collections.singletonList("testBiotopeType"),
                        "France",
                        0.1,
                        0.2,
                        "Italy",
                        37.5,
                        15.099722);

        geneticResourceDao.save(geneticResource);

        assertThat(geneticResourceDao.findById(geneticResource.getId()).get()).isEqualTo(geneticResource);
    }

    @Test
    public void shouldSearchOnName() {
        shouldSearch(GeneticResourceBuilder::withName);
    }

    @Test
    public void shouldSearchOnDescription() {
        shouldSearch(GeneticResourceBuilder::withDescription);
    }

    @Test
    public void shouldSearchOnPillarName() {
        shouldSearch(GeneticResourceBuilder::withPillarName);
    }

    @Test
    public void shouldSearchOnDatabaseSource() {
        shouldSearch(GeneticResourceBuilder::withDatabaseSource);
    }

    @Test
    public void shouldSearchOnDomain() {
        shouldSearch(GeneticResourceBuilder::withDomain);
    }

    @Test
    public void shouldSearchOnTaxon() {
        shouldSearch((b, s) -> b.withTaxon(Collections.singletonList(s)));
    }

    @Test
    public void shouldSearchOnFamily() {
        shouldSearch((b, s) -> b.withFamily(Collections.singletonList(s)));
    }

    @Test
    public void shouldSearchOnGenus() {
        shouldSearch((b, s) -> b.withGenus(Collections.singletonList(s)));
    }

    @Test
    public void shouldSearchOnSpecies() {
        shouldSearch((b, s) -> b.withSpecies(Collections.singletonList(s)));
    }

    @Test
    public void shouldSearchOnMaterialType() {
        shouldSearch((b, s) -> b.withMaterialType(Collections.singletonList(s)));
    }

    @Test
    public void shouldSearchOnBiotopeType() {
        shouldSearch((b, s) -> b.withBiotopeType(Collections.singletonList(s)));
    }

    @Test
    public void shouldSearchOnCountryOfOrigin() {
        shouldSearch(GeneticResourceBuilder::withCountryOfOrigin);
    }

    @Test
    public void shouldSearchOnCountryOfCollect() {
        shouldSearch(GeneticResourceBuilder::withCountryOfCollect);
    }

    @Test
    public void shouldNotSearchOnIdentifier() {
        GeneticResource geneticResource = new GeneticResourceBuilder().build();
        geneticResourceDao.save(geneticResource);

        assertThat(geneticResourceDao.search(geneticResource.getId(), false, firstPage).getContent()).isEmpty();
    }

    @Test
    public void shouldNotSearchOnUrls() {
        GeneticResource geneticResource =
            new GeneticResourceBuilder().withDataURL("foo bar baz").withPortalURL("foo bar baz").build();
        geneticResourceDao.save(geneticResource);

        assertThat(geneticResourceDao.search("bar", false, firstPage).getContent()).isEmpty();
    }

    private void shouldSearch(BiConsumer<GeneticResourceBuilder, String> config) {
        GeneticResourceBuilder geneticResourceBuilder = new GeneticResourceBuilder();
        config.accept(geneticResourceBuilder, "foo bar baz");
        GeneticResource geneticResource = geneticResourceBuilder.build();

        geneticResourceDao.save(geneticResource);

        AggregatedPage<GeneticResource> result = geneticResourceDao.search("bar", false, firstPage);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getAggregations()).isNull();

        result = geneticResourceDao.search("bing", false, firstPage);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    public void shouldSearchAndAggregate() {
        GeneticResource geneticResource1 = new GeneticResourceBuilder()
            .withId("r1")
            .withName("foo")
            .withDomain("Plantae")
            .withBiotopeType(Arrays.asList("Biotope", "Human host"))
            .withMaterialType(Arrays.asList("Specimen", "DNA"))
            .withCountryOfOrigin("France")
            .build();

        GeneticResource geneticResource2 = new GeneticResourceBuilder()
            .withId("r2")
            .withName("bar foo")
            .withDomain("Fungi")
            .withBiotopeType(Arrays.asList("Biotope"))
            .withMaterialType(Arrays.asList("DNA"))
            .withCountryOfOrigin("France")
            .build();

        geneticResourceDao.saveAll(Arrays.asList(geneticResource1, geneticResource2));

        AggregatedPage<GeneticResource> result = geneticResourceDao.search("foo", true, firstPage);
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
    }
}

