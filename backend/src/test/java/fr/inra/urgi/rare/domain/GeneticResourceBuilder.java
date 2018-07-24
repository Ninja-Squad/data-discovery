package fr.inra.urgi.rare.domain;

import java.util.Collections;
import java.util.List;

/**
 * Builder for {@link GeneticResource}
 * @author JB Nizet
 */
public class GeneticResourceBuilder {
    private String id;

    private String name;
    private String description;

    private String pillarName;
    private String databaseSource;
    private String portalURL;
    private String dataURL;
    private String domain;
    private List<String> taxon = Collections.emptyList();
    private List<String> family = Collections.emptyList();
    private List<String> genus = Collections.emptyList();
    private List<String> species = Collections.emptyList();
    private List<String> materialType = Collections.emptyList();
    private List<String> biotopeType = Collections.emptyList();
    private String countryOfOrigin;
    private Double originLatitude;
    private Double originLongitude;
    private String countryOfCollect;
    private Double collectLatitude;
    private Double collectLongitude;

    public GeneticResourceBuilder withId(String id) {
        this.id = id;
        return this;
    }

    public GeneticResourceBuilder withName(String name) {
        this.name = name;
        return this;
    }

    public GeneticResourceBuilder withDescription(String description) {
        this.description = description;
        return this;
    }

    public GeneticResourceBuilder withPillarName(String pillarName) {
        this.pillarName = pillarName;
        return this;
    }

    public GeneticResourceBuilder withDatabaseSource(String databaseSource) {
        this.databaseSource = databaseSource;
        return this;
    }

    public GeneticResourceBuilder withPortalURL(String portalURL) {
        this.portalURL = portalURL;
        return this;
    }

    public GeneticResourceBuilder withDataURL(String dataURL) {
        this.dataURL = dataURL;
        return this;
    }

    public GeneticResourceBuilder withDomain(String domain) {
        this.domain = domain;
        return this;
    }

    public GeneticResourceBuilder withTaxon(List<String> taxon) {
        this.taxon = taxon;
        return this;
    }

    public GeneticResourceBuilder withFamily(List<String> family) {
        this.family = family;
        return this;
    }

    public GeneticResourceBuilder withGenus(List<String> genus) {
        this.genus = genus;
        return this;
    }

    public GeneticResourceBuilder withSpecies(List<String> species) {
        this.species = species;
        return this;
    }

    public GeneticResourceBuilder withMaterialType(List<String> materialType) {
        this.materialType = materialType;
        return this;
    }

    public GeneticResourceBuilder withBiotopeType(List<String> biotopeType) {
        this.biotopeType = biotopeType;
        return this;
    }

    public GeneticResourceBuilder withCountryOfOrigin(String countryOfOrigin) {
        this.countryOfOrigin = countryOfOrigin;
        return this;
    }

    public GeneticResourceBuilder withOriginLatitude(Double originLatitude) {
        this.originLatitude = originLatitude;
        return this;
    }

    public GeneticResourceBuilder withOriginLongitude(Double originLongitude) {
        this.originLongitude = originLongitude;
        return this;
    }

    public GeneticResourceBuilder withCountryOfCollect(String countryOfCollect) {
        this.countryOfCollect = countryOfCollect;
        return this;
    }

    public GeneticResourceBuilder withCollectLatitude(Double collectLatitude) {
        this.collectLatitude = collectLatitude;
        return this;
    }

    public GeneticResourceBuilder withCollectLongitude(Double collectLongitude) {
        this.collectLongitude = collectLongitude;
        return this;
    }

    public GeneticResource build() {
        return new GeneticResource(id,
                                   name,
                                   description,
                                   pillarName,
                                   databaseSource,
                                   portalURL,
                                   dataURL,
                                   domain,
                                   taxon,
                                   family,
                                   genus,
                                   species,
                                   materialType,
                                   biotopeType,
                                   countryOfOrigin,
                                   originLatitude,
                                   originLongitude,
                                   countryOfCollect,
                                   collectLatitude,
                                   collectLongitude);
    }
}
