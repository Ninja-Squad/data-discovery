package fr.inra.urgi.datadiscovery.domain;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import org.springframework.context.annotation.Profile;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Mapping;

import java.util.*;

/**
 * The Suggestion document for any DataDiscovery application.
 * @author R. Flores
 */
@Document(
    indexName = "#{@dataDiscoveryProperties.getElasticsearchPrefix()}suggestions-alias",
    type = "#{@dataDiscoveryProperties.getElasticsearchPrefix()}suggestions",
    createIndex = false
)
@Mapping(mappingPath = "fr/inra/urgi/datadiscovery/domain/suggestions.mapping.json")
@Profile({AppProfile.DATADISCOVERY, AppProfile.RARE, AppProfile.WHEATIS})
public final class SuggestionDocument implements fr.inra.urgi.datadiscovery.domain.Document {


    private final String suggestions;

    public SuggestionDocument(String suggestions) {
        this.suggestions = suggestions;
    }

    public SuggestionDocument(SuggestionDocument.Builder builder) {
        this(builder.suggestions);
    }

    public String getSuggestions() {
        return suggestions;
    }

    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        SuggestionDocument that = (SuggestionDocument) o;
        return
                Objects.equals(suggestions, that.suggestions);
    }

    public int hashCode() {
        return Objects.hash(
                suggestions);
    }

    public String toString() {
        return "SuggestionDocument{" +
                "suggestions='" + suggestions + '\'' +
                '}';
    }

    public static SuggestionDocument.Builder builder() {
        return new SuggestionDocument.Builder();
    }

    public static SuggestionDocument.Builder builder(SuggestionDocument document) {
        return new SuggestionDocument.Builder(document);
    }

    public static class Builder {
        private String suggestions;

        private Builder() {
        }

        private Builder(SuggestionDocument document) {
            this.suggestions = document.getSuggestions();
        }

        public SuggestionDocument.Builder withSuggestion(String suggestion) {
            this.suggestions = suggestion;
            return this;
        }

        public SuggestionDocument build() {
            return new SuggestionDocument(this);
        }
    }
}
