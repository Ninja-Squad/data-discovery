package fr.inra.urgi.datadiscovery.ontology.api;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * An ontology, as returned from the "list ontologies" BrAPI API endpoint
 * @author JB Nizet
 */
public final class Ontology {
    private final String ontologyDbId;
    private final String ontologyName;
    private final String authors;
    private final String copyright;
    private final String license;
    private final List<Link> links;
    private final String version;

    @JsonCreator
    public Ontology(String ontologyDbId,
                    String ontologyName,
                    String authors,
                    String copyright,
                    String license,
                    List<Link> links,
                    String version) {
        this.ontologyDbId = ontologyDbId;
        this.ontologyName = ontologyName;
        this.authors = authors;
        this.copyright = copyright;
        this.license = license;
        this.links = links;
        this.version = version;
    }

    public String getOntologyDbId() {
        return ontologyDbId;
    }

    public String getOntologyName() {
        return ontologyName;
    }

    public String getAuthors() {
        return authors;
    }

    public String getCopyright() {
        return copyright;
    }

    public String getLicense() {
        return license;
    }

    public List<Link> getLinks() {
        return links;
    }

    public String getVersion() {
        return version;
    }

    @Override
    public String toString() {
        return "Ontology{" +
            "ontologyDbId='" + ontologyDbId + '\'' +
            ", ontologyName='" + ontologyName + '\'' +
            ", authors=" + authors +
            ", copyright=" + copyright +
            ", license='" + license + '\'' +
            ", links=" + links +
            ", version='" + version + '\'' +
            '}';
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private String ontologyDbId;
        private String ontologyName;
        private String authors;
        private String copyright;
        private String license;
        private List<Link> links = new ArrayList<>();
        private String version;

        private Builder() {
        }

        public Builder withOntologyDbId(String ontologyDbId) {
            this.ontologyDbId = ontologyDbId;
            return this;
        }

        public Builder withOntologyName(String ontologyName) {
            this.ontologyName = ontologyName;
            return this;
        }

        public Builder withAuthors(String authors) {
            this.authors = authors;
            return this;
        }

        public Builder withCopyright(String copyright) {
            this.copyright = copyright;
            return this;
        }

        public Builder withLicense(String license) {
            this.license = license;
            return this;
        }

        public Builder withLinks(List<Link> links) {
            this.links = links;
            return this;
        }

        public Builder withVersion(String version) {
            this.version = version;
            return this;
        }

        public Ontology build() {
            return new Ontology(ontologyDbId,
                                ontologyName,
                                authors,
                                copyright,
                                license,
                                links,
                                version);
        }
    }
}
