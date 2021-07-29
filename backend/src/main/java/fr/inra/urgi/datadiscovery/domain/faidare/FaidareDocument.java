package fr.inra.urgi.datadiscovery.domain.faidare;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.datadiscovery.domain.SearchDocument;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.PersistenceConstructor;
import org.springframework.data.elasticsearch.annotations.Mapping;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

import static fr.inra.urgi.datadiscovery.util.Utils.nullSafeUnmodifiableCopy;

/**
 * The document for the Faidare application
 * @author JB Nizet
 */
@org.springframework.data.elasticsearch.annotations.Document(
    indexName = "#{@dataDiscoveryProperties.getElasticsearchPrefix()}resource-alias",
    createIndex = false
)
@Mapping(mappingPath = "fr/inra/urgi/datadiscovery/domain/faidare/FaidareGeneticResource.mapping.json")
public final class FaidareDocument implements SearchDocument {
    @Id
    @JsonProperty("identifier")
    private final String id;
    private final String name;
    private final String entryType;
    private final String databaseName;
    private final String url;
    private final List<String> species;
    private final String node;
    private final String description;
    private final List<String> annotationId;
    private final List<String> annotationName;
    private final List<String> ancestors;
    private final String holdingInstitute;
    private final String biologicalStatus;
    private final String geneticNature;
    private final String countryOfOrigin;
    private final List<String> taxonGroup;

    @JsonCreator
    @PersistenceConstructor
    public FaidareDocument(@JsonProperty("identifier") String id,
                           String name,
                           String entryType,
                           String databaseName,
                           String url,
                           List<String> species,
                           String node,
                           String description,
                           List<String> annotationId,
                           List<String> annotationName,
                           List<String> ancestors,
                           String holdingInstitute,
                           String biologicalStatus,
                           String geneticNature,
                           String countryOfOrigin,
                           List<String> taxonGroup) {
        this.id = id;
        this.name = name;
        this.entryType = entryType;
        this.databaseName = databaseName;
        this.url = url;
        this.species = nullSafeUnmodifiableCopy(species);
        this.node = node;
        this.description = description;
        this.annotationId = annotationId;
        this.annotationName = annotationName;
        this.ancestors = ancestors;
        this.holdingInstitute = holdingInstitute;
        this.biologicalStatus = biologicalStatus;
        this.geneticNature = geneticNature;
        this.countryOfOrigin = countryOfOrigin;
        this.taxonGroup = taxonGroup;
    }

    public FaidareDocument(Builder builder) {
        this(builder.id,
             builder.name,
             builder.entryType,
             builder.databaseName,
             builder.url,
             builder.species,
             builder.node,
             builder.description,
             builder.annotationId,
             builder.annotationName,
             builder.ancestors,
             builder.holdingInstitute,
             builder.biologicalStatus,
             builder.geneticNature,
             builder.countryOfOrigin,
             builder.taxonGroup);
    }

    @Override
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEntryType() {
        return entryType;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public String getUrl() {
        return url;
    }

    public List<String> getSpecies() {
        return species;
    }

    public String getNode() {
        return node;
    }

    @Override
    public String getDescription() {
        return description;
    }

    public List<String> getAnnotationId() {
        return annotationId;
    }

    public List<String> getAnnotationName() {
        return annotationName;
    }

    public List<String> getAncestors() {
        return ancestors;
    }

    public String getHoldingInstitute() {
        return holdingInstitute;
    }

    public String getBiologicalStatus() {
        return biologicalStatus;
    }

    public String getGeneticNature() {
        return geneticNature;
    }

    public String getCountryOfOrigin() {
        return countryOfOrigin;
    }

    public List<String> getTaxonGroup() {
        return taxonGroup;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        FaidareDocument that = (FaidareDocument) o;
        return Objects.equals(id, that.id) &&
            Objects.equals(name, that.name) &&
            Objects.equals(entryType, that.entryType) &&
            Objects.equals(databaseName, that.databaseName) &&
            Objects.equals(url, that.url) &&
            Objects.equals(species, that.species) &&
            Objects.equals(node, that.node) &&
            Objects.equals(description, that.description) &&
            Objects.equals(annotationId, that.annotationId) &&
            Objects.equals(annotationName, that.annotationName) &&
            Objects.equals(ancestors, that.ancestors) &&
            Objects.equals(holdingInstitute, that.holdingInstitute) &&
            Objects.equals(biologicalStatus, that.biologicalStatus) &&
            Objects.equals(geneticNature, that.geneticNature) &&
            Objects.equals(countryOfOrigin, that.countryOfOrigin) &&
            Objects.equals(taxonGroup, that.taxonGroup);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id,
                            name,
                            entryType,
                            databaseName,
                            url,
                            species,
                            node,
                            description,
                            annotationId,
                            annotationName,
                            ancestors,
                            holdingInstitute,
                            biologicalStatus,
                            geneticNature,
                            countryOfOrigin,
                            taxonGroup);
    }

    @Override
    public String toString() {
        return "FaidareDocument{" +
            "id='" + id + '\'' +
            ", name='" + name + '\'' +
            ", entryType='" + entryType + '\'' +
            ", databaseName='" + databaseName + '\'' +
            ", url='" + url + '\'' +
            ", species=" + species +
            ", node='" + node + '\'' +
            ", description='" + description + '\'' +
            ", annotationId=" + annotationId +
            ", annotationName=" + annotationName +
            ", ancestors=" + ancestors +
            ", holdingInstitute='" + holdingInstitute + '\'' +
            ", biologicalStatus='" + biologicalStatus + '\'' +
            ", geneticNature='" + geneticNature + '\'' +
            ", countryOfOrigin='" + countryOfOrigin + '\'' +
            ", taxonGroup='" + taxonGroup + '\'' +
            '}';
    }

    public static Builder builder() {
        return new Builder();
    }

    public static Builder builder(FaidareDocument document) {
        return new FaidareDocument.Builder(document);
    }

    public static class Builder {
        private String id;

        private String name;
        private String entryType;
        private String databaseName;
        private String url;
        private List<String> species = Collections.emptyList();
        private String node;
        private String description;
        private List<String> annotationId;
        private List<String> annotationName;
        private List<String> ancestors;
        private String holdingInstitute;
        private String biologicalStatus;
        private String geneticNature;
        private String countryOfOrigin;
        private List<String> taxonGroup;

        private Builder() {
        }

        private Builder(FaidareDocument document) {
            this.id = document.getId();
            this.name = document.getName();
            this.entryType= document.getEntryType();
            this.databaseName = document.getDatabaseName();
            this.url = document.getUrl();
            this.species = document.getSpecies();
            this.node = document.getNode();
            this.description = document.getDescription();
            this.annotationId = document.getAnnotationId();
            this.annotationName = document.getAnnotationName();
            this.ancestors = document.getAncestors();
            this.holdingInstitute = document.getHoldingInstitute();
            this.biologicalStatus = document.getBiologicalStatus();
            this.geneticNature = document.getGeneticNature();
            this.countryOfOrigin = document.getCountryOfOrigin();
            this.taxonGroup = document.getTaxonGroup();
        }

        public Builder withId(String id) {
            this.id = id;
            return this;
        }

        public Builder withName(String name) {
            this.name = name;
            return this;
        }

        public Builder withEntryType(String entryType) {
            this.entryType = entryType;
            return this;
        }

        public Builder withDatabaseName(String databaseName) {
            this.databaseName = databaseName;
            return this;
        }

        public Builder withUrl(String url) {
            this.url = url;
            return this;
        }

        public Builder withSpecies(List<String> species) {
            this.species = species;
            return this;
        }

        public Builder withNode(String node) {
            this.node = node;
            return this;
        }

        public Builder withDescription(String description) {
            this.description = description;
            return this;
        }

        public Builder withAnnotationName(List<String> annotationName) {
            this.annotationName = annotationName;
            return this;
        }

        public Builder withAnnotationId(List<String> annotationId) {
            this.annotationId = annotationId;
            return this;
        }

        public Builder withAncestors(List<String> ancestors) {
            this.ancestors = ancestors;
            return this;
        }

        public Builder withHoldingInstitute(String holdingInstitute) {
            this.holdingInstitute = holdingInstitute;
            return this;
        }

        public Builder withBiologicalStatus(String biologicalStatus) {
            this.biologicalStatus = biologicalStatus;
            return this;
        }

        public Builder withGeneticNature(String geneticNature) {
            this.geneticNature = geneticNature;
            return this;
        }

        public Builder withCountryOfOrigin(String countryOfOrigin) {
            this.countryOfOrigin = countryOfOrigin;
            return this;
        }

        public Builder withTaxonGroup(List<String> taxonGroup) {
            this.taxonGroup = taxonGroup;
            return this;
        }

        public FaidareDocument build() {
            return new FaidareDocument(this);
        }
    }
}
