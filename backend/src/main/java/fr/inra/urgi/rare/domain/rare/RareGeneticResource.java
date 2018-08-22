package fr.inra.urgi.rare.domain.rare;

import static fr.inra.urgi.rare.util.Utils.nullSafeUnmodifiableCopy;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.domain.Location;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;

/**
 * A genetic resource of the Rare app, as loaded from a JSON file, and stored in ElasticSearch.
 *
 * This document is used by all the search operations, but not by the harvesting process, which instead uses
 * {@link RareIndexedGeneticResource}. Its index is in fact an alias which typically refers to the same physical index as
 * the alias used by {@link RareIndexedGeneticResource}, except when we want to harvest to a new index
 * (in order to delete obsolete documents, or to accomodate with incompatible schema changes). In that case, once the
 * harvest process is finished, the alias of {@link RareGeneticResource} can be modified to refer to the new physical
 * index, in order to start searching in the newly harvested documents.
 *
 * @author JB Nizet
 */
@Document(
    indexName = "#{@rareProperties.getElasticsearchPrefix()}resource-index",
    type = "#{@rareProperties.getElasticsearchPrefix()}resource",
    createIndex = false
)
public class RareGeneticResource implements GeneticResource {

    @Id
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
    private final Location locationOfOrigin;
    private final String countryOfCollect;
    private final Location locationOfCollect;

    @JsonCreator
    public RareGeneticResource(@JsonProperty("identifier") String id,
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
                               Location locationOfOrigin,
                               String countryOfCollect,
                               Location locationOfCollect) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.pillarName = pillarName;
        this.databaseSource = databaseSource;
        this.portalURL = portalURL;
        this.dataURL = dataURL;
        this.domain = domain;
        this.taxon = nullSafeUnmodifiableCopy(taxon);
        this.family = nullSafeUnmodifiableCopy(family);
        this.genus = nullSafeUnmodifiableCopy(genus);
        this.species = nullSafeUnmodifiableCopy(species);
        this.materialType = nullSafeUnmodifiableCopy(materialType);
        this.biotopeType = nullSafeUnmodifiableCopy(biotopeType);
        this.countryOfOrigin = countryOfOrigin;
        this.locationOfOrigin = locationOfOrigin;
        this.countryOfCollect = countryOfCollect;
        this.locationOfCollect = locationOfCollect;
    }

    private RareGeneticResource(Builder builder) {
        this(builder.id,
             builder.name,
             builder.description,
             builder.pillarName,
             builder.databaseSource,
             builder.portalURL,
             builder.dataURL,
             builder.domain,
             builder.taxon,
             builder.family,
             builder.genus,
             builder.species,
             builder.materialType,
             builder.biotopeType,
             builder.countryOfOrigin,
             builder.locationOfOrigin,
             builder.countryOfCollect,
             builder.locationOfCollect);
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

    public Location getLocationOfOrigin() {
        return locationOfOrigin;
    }

    public String getCountryOfCollect() {
        return countryOfCollect;
    }

    public Location getLocationOfCollect() {
        return locationOfCollect;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        RareGeneticResource that = (RareGeneticResource) o;
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
            Objects.equals(locationOfOrigin, that.locationOfOrigin) &&
            Objects.equals(countryOfCollect, that.countryOfCollect) &&
            Objects.equals(locationOfCollect, that.locationOfCollect);
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
                            locationOfOrigin,
                            countryOfCollect,
                            locationOfCollect);
    }

    @Override
    public String toString() {
        return "RareGeneticResource{" +
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
            ", locationOfOrigin=" + locationOfOrigin +
            ", countryOfCollect='" + countryOfCollect + '\'' +
            ", locationOfCollect=" + locationOfCollect +
            '}';
    }

    public static Builder builder() {
        return new Builder();
    }

    public static Builder builder(RareGeneticResource geneticResource) {
        return new Builder(geneticResource);
    }

    public static class Builder {
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
        private Location locationOfOrigin;
        private String countryOfCollect;
        private Location locationOfCollect;

        private Builder() {
        }

        private Builder(RareGeneticResource geneticResource) {
            this.id = geneticResource.getId();
            this.name = geneticResource.getName();
            this.description = geneticResource.getDescription();
            this.pillarName = geneticResource.getPillarName();
            this.databaseSource = geneticResource.getDatabaseSource();
            this.portalURL = geneticResource.getPortalURL();
            this.dataURL = geneticResource.getDataURL();
            this.domain = geneticResource.getDomain();
            this.taxon = geneticResource.getTaxon();
            this.family = geneticResource.getFamily();
            this.genus = geneticResource.getGenus();
            this.species = geneticResource.getSpecies();
            this.materialType = geneticResource.getMaterialType();
            this.biotopeType = geneticResource.getBiotopeType();
            this.countryOfOrigin = geneticResource.getCountryOfOrigin();
            this.locationOfOrigin = geneticResource.getLocationOfOrigin();
            this.countryOfCollect = geneticResource.getCountryOfCollect();
            this.locationOfCollect = geneticResource.getLocationOfCollect();
        }

        public Builder withId(String id) {
            this.id = id;
            return this;
        }

        public Builder withName(String name) {
            this.name = name;
            return this;
        }

        public Builder withDescription(String description) {
            this.description = description;
            return this;
        }

        public Builder withPillarName(String pillarName) {
            this.pillarName = pillarName;
            return this;
        }

        public Builder withDatabaseSource(String databaseSource) {
            this.databaseSource = databaseSource;
            return this;
        }

        public Builder withPortalURL(String portalURL) {
            this.portalURL = portalURL;
            return this;
        }

        public Builder withDataURL(String dataURL) {
            this.dataURL = dataURL;
            return this;
        }

        public Builder withDomain(String domain) {
            this.domain = domain;
            return this;
        }

        public Builder withTaxon(List<String> taxon) {
            this.taxon = taxon;
            return this;
        }

        public Builder withFamily(List<String> family) {
            this.family = family;
            return this;
        }

        public Builder withGenus(List<String> genus) {
            this.genus = genus;
            return this;
        }

        public Builder withSpecies(List<String> species) {
            this.species = species;
            return this;
        }

        public Builder withMaterialType(List<String> materialType) {
            this.materialType = materialType;
            return this;
        }

        public Builder withBiotopeType(List<String> biotopeType) {
            this.biotopeType = biotopeType;
            return this;
        }

        public Builder withCountryOfOrigin(String countryOfOrigin) {
            this.countryOfOrigin = countryOfOrigin;
            return this;
        }

        public Builder withLocationOfOrigin(Location locationOfOrigin) {
            this.locationOfOrigin = locationOfOrigin;
            return this;
        }

        public Builder withCountryOfCollect(String countryOfCollect) {
            this.countryOfCollect = countryOfCollect;
            return this;
        }

        public Builder withLocationOfCollect(Location locationOfCollect) {
            this.locationOfCollect = locationOfCollect;
            return this;
        }

        public RareGeneticResource build() {
            return new RareGeneticResource(this);
        }
    }
}
