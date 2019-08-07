package fr.inra.urgi.datadiscovery.domain.rare;

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
 * A class containing all the fields of a {@link RareDocument}, and additional fields used uniquely for indexing
 * and which thus make it possible or easier to implement completion suggestions.
 *
 * This document is used by the harvesting process. Its index is in fact an alias which typically refers to the same
 * physical index as the alias used by {@link RareDocument}, except when we want to harvest to a new index
 * (in order to delete obsolete documents, or to accomodate with incompatible schema changes). In that case, once the
 * harvest process is finished, the alias of {@link RareDocument} can be modified to refer to the new physical
 * index, in order to start searching in the newly harvested documents.
 *
 * @author JB Nizet
 */
@Document(
    indexName = "#{@dataDiscoveryProperties.getElasticsearchPrefix()}resource-harvest-index",
    type = "#{@dataDiscoveryProperties.getElasticsearchPrefix()}resource",
    createIndex = false
)
@Mapping(mappingPath = "fr/inra/urgi/datadiscovery/domain/rare/RareGeneticResource.mapping.json")
@Deprecated
public final class RareIndexedDocument implements IndexedDocument<RareDocument> {
    @JsonUnwrapped
    private final RareDocument document;

    /**
     * The list of completion suggestions that are valid for this document.
     */
    private final List<String> suggestions;

    public RareIndexedDocument(RareDocument document) {
        this.document = document;
        List<String> list = new ArrayList<>();
        addIfNotBlank(list, document.getName());
        addIfNotBlank(list, document.getPillarName());
        addIfNotBlank(list, document.getDatabaseSource());
        addIfNotBlank(list, document.getDomain());
        addAllIfNotBlank(list, document.getTaxon());
        addAllIfNotBlank(list, document.getFamily());
        addAllIfNotBlank(list, document.getGenus());
        addAllIfNotBlank(list, document.getSpecies());
        addAllIfNotBlank(list, document.getMaterialType());
        addAllIfNotBlank(list, document.getBiotopeType());
        addIfNotBlank(list, document.getCountryOfOrigin());
        addIfNotBlank(list, document.getCountryOfCollect());
        IndexedDocument.extractTokensOutOfDescription(document.getDescription()).forEach(list::add);

        this.suggestions = Collections.unmodifiableList(list);
    }

    @Override
    public RareDocument getDocument() {
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
        RareIndexedDocument that = (RareIndexedDocument) o;
        return Objects.equals(document, that.document) &&
            Objects.equals(suggestions, that.suggestions);
    }

    @Override
    public int hashCode() {
        return Objects.hash(document, suggestions);
    }

    @Override
    public String toString() {
        return "RareIndexedDocument{" +
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
