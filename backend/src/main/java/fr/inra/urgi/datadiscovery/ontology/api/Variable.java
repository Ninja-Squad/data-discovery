package fr.inra.urgi.datadiscovery.ontology.api;

import java.util.ArrayList;
import java.util.List;

/**
 * A Variable returned from the "list variables" BRApi endpoint
 *
 * @author JB Nizet
 */
public final class Variable {
    private final String ontologyName;
    private final String name;
    private final Trait trait;
    private final String ontologyDbId;
    private final String observationVariableDbId;
    private final List<String> synonyms;
    private final List<String> contextOfUse;
    private final String growthStage;
    private final String status;
    private final String xref;
    private final String institution;
    private final String scientist;
    private final String date;
    private final String language;
    private final String crop;
    private final String defaultValue;
    private final Method method;
    private final Scale scale;
    private final String documentationURL;

    public Variable(String ontologyName,
                    String name,
                    Trait trait,
                    String ontologyDbId,
                    String observationVariableDbId,
                    List<String> synonyms,
                    List<String> contextOfUse,
                    String growthStage,
                    String status,
                    String xref,
                    String institution,
                    String scientist,
                    String date,
                    String language,
                    String crop,
                    String defaultValue,
                    Method method,
                    Scale scale,
                    String documentationURL) {
        this.ontologyName = ontologyName;
        this.name = name;
        this.trait = trait;
        this.ontologyDbId = ontologyDbId;
        this.observationVariableDbId = observationVariableDbId;
        this.synonyms = synonyms;
        this.contextOfUse = contextOfUse;
        this.growthStage = growthStage;
        this.status = status;
        this.xref = xref;
        this.institution = institution;
        this.scientist = scientist;
        this.date = date;
        this.language = language;
        this.crop = crop;
        this.defaultValue = defaultValue;
        this.method = method;
        this.scale = scale;
        this.documentationURL = documentationURL;
    }

    public String getOntologyName() {
        return ontologyName;
    }

    public String getName() {
        return name;
    }

    public Trait getTrait() {
        return trait;
    }

    public String getOntologyDbId() {
        return ontologyDbId;
    }

    public String getObservationVariableDbId() {
        return observationVariableDbId;
    }

    public List<String> getSynonyms() {
        return synonyms;
    }

    public List<String> getContextOfUse() {
        return contextOfUse;
    }

    public String getGrowthStage() {
        return growthStage;
    }

    public String getStatus() {
        return status;
    }

    public String getXref() {
        return xref;
    }

    public String getInstitution() {
        return institution;
    }

    public String getScientist() {
        return scientist;
    }

    public String getDate() {
        return date;
    }

    public String getLanguage() {
        return language;
    }

    public String getCrop() {
        return crop;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public Method getMethod() {
        return method;
    }

    public Scale getScale() {
        return scale;
    }

    public String getDocumentationURL() {
        return documentationURL;
    }

    @Override
    public String toString() {
        return "Variable{" +
            "ontologyName='" + ontologyName + '\'' +
            ", name='" + name + '\'' +
            ", trait=" + trait +
            ", ontologyDbId='" + ontologyDbId + '\'' +
            ", observationVariableDbId='" + observationVariableDbId + '\'' +
            ", synonyms=" + synonyms +
            ", contextOfUse=" + contextOfUse +
            ", growthStage='" + growthStage + '\'' +
            ", status='" + status + '\'' +
            ", xref='" + xref + '\'' +
            ", institution='" + institution + '\'' +
            ", scientist='" + scientist + '\'' +
            ", date='" + date + '\'' +
            ", language='" + language + '\'' +
            ", crop='" + crop + '\'' +
            ", defaultValue='" + defaultValue + '\'' +
            ", method=" + method +
            ", scale=" + scale +
            ", documentationURL='" + documentationURL + '\'' +
            '}';
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private String ontologyName;
        private String name;
        private Trait trait;
        private String ontologyDbId;
        private String observationVariableDbId;
        private List<String> synonyms = new ArrayList<>();
        private List<String> contextOfUse = new ArrayList<>();
        private String growthStage;
        private String status;
        private String xref;
        private String institution;
        private String scientist;
        private String date;
        private String language;
        private String crop;
        private String defaultValue;
        private Method method;
        private Scale scale;
        private String documentationURL;

        private Builder() {
        }

        public Builder withOntologyName(String ontologyName) {
            this.ontologyName = ontologyName;
            return this;
        }

        public Builder withName(String name) {
            this.name = name;
            return this;
        }

        public Builder withTrait(Trait trait) {
            this.trait = trait;
            return this;
        }

        public Builder withOntologyDbId(String ontologyDbId) {
            this.ontologyDbId = ontologyDbId;
            return this;
        }

        public Builder withObservationVariableDbId(String observationVariableDbId) {
            this.observationVariableDbId = observationVariableDbId;
            return this;
        }

        public Builder withSynonyms(List<String> synonyms) {
            this.synonyms = synonyms;
            return this;
        }

        public Builder withContextOfUse(List<String> contextOfUse) {
            this.contextOfUse = contextOfUse;
            return this;
        }

        public Builder withGrowthStage(String growthStage) {
            this.growthStage = growthStage;
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

        public Builder withInstitution(String institution) {
            this.institution = institution;
            return this;
        }

        public Builder withScientist(String scientist) {
            this.scientist = scientist;
            return this;
        }

        public Builder withDate(String date) {
            this.date = date;
            return this;
        }

        public Builder withLanguage(String language) {
            this.language = language;
            return this;
        }

        public Builder withCrop(String crop) {
            this.crop = crop;
            return this;
        }

        public Builder withDefaultValue(String defaultValue) {
            this.defaultValue = defaultValue;
            return this;
        }

        public Builder withMethod(Method method) {
            this.method = method;
            return this;
        }

        public Builder withScale(Scale scale) {
            this.scale = scale;
            return this;
        }

        public Builder withDocumentationURL(String documentationURL) {
            this.documentationURL = documentationURL;
            return this;
        }

        public Variable build() {
            return new Variable(
                ontologyName,
                name,
                trait,
                ontologyDbId,
                observationVariableDbId,
                synonyms,
                contextOfUse,
                growthStage,
                status,
                xref,
                institution,
                scientist,
                date,
                language,
                crop,
                defaultValue,
                method,
                scale,
                documentationURL
            );
        }
    }
}
