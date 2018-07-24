package fr.inra.urgi.rare.domain;

import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * A genetic resource, as loaded from a JSON file, and stored in ElasticSearch
 * @author JB Nizet
 */
public final class GeneticResource {
    @JsonProperty("identifier")
    private final String id;

    private final String name;
    private final String description;

    private final String pillarName;
    private final String databaseSource;
    private final String portalURL;
    private final String dataURL;
    private final String domain;
    private final List<String> taxon;
    private final List<String> family;
    private final List<String> genus;
    private final List<String> species;
    private final List<String> materialType;
    private final List<String> biotopeType;
    private final String countryOfOrigin;
    private final Double originLatitude;
    private final Double originLongitude;
    private final String countryOfCollect;
    private final Double collectLatitude;
    private final Double collectLongitude;

    @JsonCreator
    public GeneticResource(@JsonProperty("identifier") String id,
                           String name,
                           String description,
                           String pillarName,
                           String databaseSource,
                           String portalURL,
                           String dataURL,
                           String domain,
                           List<String> taxon,
                           List<String> family,
                           List<String> genus,
                           List<String> species,
                           List<String> materialType,
                           List<String> biotopeType,
                           String countryOfOrigin,
                           Double originLatitude,
                           Double originLongitude,
                           String countryOfCollect,
                           Double collectLatitude,
                           Double collectLongitude) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.pillarName = pillarName;
        this.databaseSource = databaseSource;
        this.portalURL = portalURL;
        this.dataURL = dataURL;
        this.domain = domain;
        this.taxon = taxon;
        this.family = family;
        this.genus = genus;
        this.species = species;
        this.materialType = materialType;
        this.biotopeType = biotopeType;
        this.countryOfOrigin = countryOfOrigin;
        this.originLatitude = originLatitude;
        this.originLongitude = originLongitude;
        this.countryOfCollect = countryOfCollect;
        this.collectLatitude = collectLatitude;
        this.collectLongitude = collectLongitude;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getPillarName() {
        return pillarName;
    }

    public String getDatabaseSource() {
        return databaseSource;
    }

    public String getPortalURL() {
        return portalURL;
    }

    public String getDataURL() {
        return dataURL;
    }

    public String getDomain() {
        return domain;
    }

    public List<String> getTaxon() {
        return taxon;
    }

    public List<String> getFamily() {
        return family;
    }

    public List<String> getGenus() {
        return genus;
    }

    public List<String> getSpecies() {
        return species;
    }

    public List<String> getMaterialType() {
        return materialType;
    }

    public List<String> getBiotopeType() {
        return biotopeType;
    }

    public String getCountryOfOrigin() {
        return countryOfOrigin;
    }

    public Double getOriginLatitude() {
        return originLatitude;
    }

    public Double getOriginLongitude() {
        return originLongitude;
    }

    public String getCountryOfCollect() {
        return countryOfCollect;
    }

    public Double getCollectLatitude() {
        return collectLatitude;
    }

    public Double getCollectLongitude() {
        return collectLongitude;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        GeneticResource that = (GeneticResource) o;
        return Objects.equals(id, that.id) &&
            Objects.equals(name, that.name) &&
            Objects.equals(description, that.description) &&
            Objects.equals(pillarName, that.pillarName) &&
            Objects.equals(databaseSource, that.databaseSource) &&
            Objects.equals(portalURL, that.portalURL) &&
            Objects.equals(dataURL, that.dataURL) &&
            Objects.equals(domain, that.domain) &&
            Objects.equals(taxon, that.taxon) &&
            Objects.equals(family, that.family) &&
            Objects.equals(genus, that.genus) &&
            Objects.equals(species, that.species) &&
            Objects.equals(materialType, that.materialType) &&
            Objects.equals(biotopeType, that.biotopeType) &&
            Objects.equals(countryOfOrigin, that.countryOfOrigin) &&
            Objects.equals(originLatitude, that.originLatitude) &&
            Objects.equals(originLongitude, that.originLongitude) &&
            Objects.equals(countryOfCollect, that.countryOfCollect) &&
            Objects.equals(collectLatitude, that.collectLatitude) &&
            Objects.equals(collectLongitude, that.collectLongitude);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id,
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

    @Override
    public String toString() {
        return "GeneticResource{" +
            "id='" + id + '\'' +
            ", name='" + name + '\'' +
            ", description='" + description + '\'' +
            ", pillarName='" + pillarName + '\'' +
            ", databaseSource='" + databaseSource + '\'' +
            ", portalURL='" + portalURL + '\'' +
            ", dataURL='" + dataURL + '\'' +
            ", domain='" + domain + '\'' +
            ", taxon='" + taxon + '\'' +
            ", family='" + family + '\'' +
            ", genus='" + genus + '\'' +
            ", species='" + species + '\'' +
            ", materialType='" + materialType + '\'' +
            ", biotopeType='" + biotopeType + '\'' +
            ", countryOfOrigin='" + countryOfOrigin + '\'' +
            ", originLatitude=" + originLatitude +
            ", originLongitude=" + originLongitude +
            ", countryOfCollect='" + countryOfCollect + '\'' +
            ", collectLatitude=" + collectLatitude +
            ", collectLongitude=" + collectLongitude +
            '}';
    }
}
