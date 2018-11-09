package fr.inra.urgi.datadiscovery.domain.wheatis;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.datadiscovery.domain.Document;
import org.springframework.data.annotation.Id;

import static fr.inra.urgi.datadiscovery.util.Utils.nullSafeUnmodifiableCopy;

/**
 * The document for the WheatIS application
 * @author JB Nizet
 */
@org.springframework.data.elasticsearch.annotations.Document(
    indexName = "#{@dataDiscoveryProperties.getElasticsearchPrefix()}resource-index",
    type = "#{@dataDiscoveryProperties.getElasticsearchPrefix()}resource",
    createIndex = false
)
public final class WheatisDocument implements Document {
    @Id
    @JsonProperty("name")
    private final String id;

    private final String entryType;
    private final String databaseName;
    private final String url;
    private final List<String> species;
    private final String node;
    private final String description;

    @JsonCreator
    public WheatisDocument(@JsonProperty("name") String id,
						   String entryType,
						   String databaseName,
						   String url,
						   List<String> species,
						   String node,
						   String description) {
        this.id = id;
        this.entryType = entryType;
        this.databaseName = databaseName;
        this.url = url;
        this.species = nullSafeUnmodifiableCopy(species);
        this.node = node;
        this.description = description;
    }

    public WheatisDocument(Builder builder) {
        this(builder.id,
             builder.entryType,
             builder.databaseName,
             builder.url,
             builder.species,
             builder.node,
             builder.description);
    }

    @Override
    public String getId() {
        return id;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        WheatisDocument that = (WheatisDocument) o;
        return Objects.equals(id, that.id) &&
            Objects.equals(entryType, that.entryType) &&
            Objects.equals(databaseName, that.databaseName) &&
            Objects.equals(url, that.url) &&
            Objects.equals(species, that.species) &&
            Objects.equals(node, that.node) &&
            Objects.equals(description, that.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, entryType, databaseName, url, species, node, description);
    }

    @Override
    public String toString() {
        return "WheatisGeneticResource{" +
            "id='" + id + '\'' +
            ", entryType='" + entryType + '\'' +
            ", databaseName='" + databaseName + '\'' +
            ", url='" + url + '\'' +
            ", species=" + species +
            ", node='" + node + '\'' +
            ", description='" + description + '\'' +
            '}';
    }

    public static Builder builder() {
        return new Builder();
    }

    public static Builder builder(WheatisDocument document) {
        return new WheatisDocument.Builder(document);
    }

    public static class Builder {
        private String id;
        private String entryType;
        private String databaseName;
        private String url;
        private List<String> species = Collections.emptyList();
        private String node;
        private String description;

        private Builder() {
        }

        private Builder(WheatisDocument document) {
            this.id = document.getId();
            this.entryType= document.getEntryType();
            this.databaseName = document.getDatabaseName();
            this.url = document.getUrl();
            this.species = document.getSpecies();
            this.node = document.getNode();
            this.description = document.getDescription();
        }

        public Builder withId(String id) {
            this.id = id;
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

        public WheatisDocument build() {
            return new WheatisDocument(this);
        }
    }
}
