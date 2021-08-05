package fr.inra.urgi.datadiscovery.ontology.api;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * The Trait of a {@link Variable}
 *
 * @author JB Nizet
 */
public final class Trait {
    private final String name;

    @JsonProperty("class")
    private final String traitClass;
    private final String traitDbId;
    private final String description;
    private final List<String> synonyms;
    private final String mainAbbreviation;
    private final List<String> alternativeAbbreviations;
    private final String entity;
    private final String attribute;
    private final String status;
    private final String xref;

    public Trait(String name,
                 String traitClass,
                 String traitDbId,
                 String description,
                 List<String> synonyms,
                 String mainAbbreviation,
                 List<String> alternativeAbbreviations,
                 String entity,
                 String attribute,
                 String status,
                 String xref) {
        this.name = name;
        this.traitClass = traitClass;
        this.traitDbId = traitDbId;
        this.description = description;
        this.synonyms = synonyms;
        this.mainAbbreviation = mainAbbreviation;
        this.alternativeAbbreviations = alternativeAbbreviations;
        this.entity = entity;
        this.attribute = attribute;
        this.status = status;
        this.xref = xref;
    }

    public String getName() {
        return name;
    }

    public String getTraitClass() {
        return traitClass;
    }

    public String getTraitDbId() {
        return traitDbId;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getSynonyms() {
        return synonyms;
    }

    public String getMainAbbreviation() {
        return mainAbbreviation;
    }

    public List<String> getAlternativeAbbreviations() {
        return alternativeAbbreviations;
    }

    public String getEntity() {
        return entity;
    }

    public String getAttribute() {
        return attribute;
    }

    public String getStatus() {
        return status;
    }

    public String getXref() {
        return xref;
    }

    @Override
    public String toString() {
        return "Trait{" +
            "name='" + name + '\'' +
            ", traitClass='" + traitClass + '\'' +
            ", traitDbId='" + traitDbId + '\'' +
            ", description='" + description + '\'' +
            ", synonyms=" + synonyms +
            ", mainAbbreviation='" + mainAbbreviation + '\'' +
            ", alternativeAbbreviations=" + alternativeAbbreviations +
            ", entity='" + entity + '\'' +
            ", attribute='" + attribute + '\'' +
            ", status='" + status + '\'' +
            ", xref='" + xref + '\'' +
            '}';
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private String name;
        private String traitClass;
        private String traitDbId;
        private String description;
        private List<String> synonyms = new ArrayList<>();
        private String mainAbbreviation;
        private List<String> alternativeAbbreviations = new ArrayList<>();
        private String entity;
        private String attribute;
        private String status;
        private String xref;

        private Builder() {
        }

        public Builder withName(String name) {
            this.name = name;
            return this;
        }

        public Builder withTraitClass(String traitClass) {
            this.traitClass = traitClass;
            return this;
        }

        public Builder withTraitDbId(String traitDbId) {
            this.traitDbId = traitDbId;
            return this;
        }

        public Builder withDescription(String description) {
            this.description = description;
            return this;
        }

        public Builder withSynonyms(List<String> synonyms) {
            this.synonyms = synonyms;
            return this;
        }

        public Builder withMainAbbreviation(String mainAbbreviation) {
            this.mainAbbreviation = mainAbbreviation;
            return this;
        }

        public Builder withAlternativeAbbreviations(List<String> alternativeAbbreviations) {
            this.alternativeAbbreviations = alternativeAbbreviations;
            return this;
        }

        public Builder withEntity(String entity) {
            this.entity = entity;
            return this;
        }

        public Builder withAttribute(String attribute) {
            this.attribute = attribute;
            return this;
        }

        public Builder withStatus(String status) {
            this.status = status;
            return this;
        }

        public Builder withXref(String xref) {
            this.xref = xref;
            return this;
        }

        public Trait build() {
            return new Trait(name,
                             traitClass,
                             traitDbId,
                             description,
                             synonyms,
                             mainAbbreviation,
                             alternativeAbbreviations,
                             entity,
                             attribute,
                             status,
                             xref);
        }
    }
}
