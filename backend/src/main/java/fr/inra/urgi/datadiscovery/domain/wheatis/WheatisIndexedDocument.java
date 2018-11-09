package fr.inra.urgi.datadiscovery.domain.wheatis;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import fr.inra.urgi.datadiscovery.domain.IndexedDocument;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Mapping;

/**
 * The indexed document for the WheatIS application.
 * @author JB Nizet
 */
@Document(
    indexName = "#{@dataDiscoveryProperties.getElasticsearchPrefix()}resource-harvest-index",
    type = "#{@dataDiscoveryProperties.getElasticsearchPrefix()}resource",
    createIndex = false
)
@Mapping(mappingPath = "fr/inra/urgi/datadiscovery/domain/wheatis/WheatisGeneticResource.mapping.json")
public final class WheatisIndexedDocument implements IndexedDocument<WheatisDocument> {
    @JsonUnwrapped
    private final WheatisDocument document;

    /**
     * The list of completion suggestions that are valid for this document.
     */
    private final List<String> suggestions;

    public WheatisIndexedDocument(WheatisDocument document) {
        this.document = document;

        List<String> list = new ArrayList<>();
        addIfNotBlank(list, document.getId());
        addIfNotBlank(list, document.getEntryType());
        addIfNotBlank(list, document.getDatabaseName());
        addIfNotBlank(list, document.getNode());
        addAllIfNotBlank(list, document.getSpecies());
        IndexedDocument.extractTokensOutOfDescription(document.getDescription()).forEach(list::add);

        this.suggestions = Collections.unmodifiableList(list);
    }

    @Override
    public WheatisDocument getDocument() {
        return document;
    }

    @Override
    public List<String> getSuggestions() {
        return suggestions;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        WheatisIndexedDocument that = (WheatisIndexedDocument) o;
        return Objects.equals(document, that.document) &&
            Objects.equals(suggestions, that.suggestions);
    }

    @Override
    public int hashCode() {
        return Objects.hash(document, suggestions);
    }

    @Override
    public String toString() {
        return "WheatisIndexedDocument{" +
            "document=" + document +
            ", suggestions=" + suggestions +
            '}';
    }

    private void addIfNotBlank(List<String> list, String s) {
        if (s != null && !s.isEmpty()) {
            list.add(s);
        }
    }

    private void addAllIfNotBlank(List<String> list, Collection<String> toAdd) {
        toAdd.forEach(s -> addIfNotBlank(list, s));
    }
}
