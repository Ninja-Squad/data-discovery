package fr.inra.urgi.rare.domain.rare;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import fr.inra.urgi.rare.domain.IndexedGeneticResource;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Mapping;

/**
 * A class containing all the fields of a GeneticResource, and additional fields used uniquely for indexing
 * and which thus make it possible or easier to implement completion suggestions.
 *
 * This document is used by the harvesting process. Its index is in fact an alias which typically refers to the same
 * physical index as the alias used by {@link RareGeneticResource}, except when we want to harvest to a new index
 * (in order to delete obsolete documents, or to accomodate with incompatible schema changes). In that case, once the
 * harvest process is finished, the alias of {@link RareGeneticResource} can be modified to refer to the new physical
 * index, in order to start searching in the newly harvested documents.
 *
 * @author JB Nizet
 */
@Document(
    indexName = "#{@rareProperties.getElasticsearchPrefix()}resource-harvest-index",
    type = "#{@rareProperties.getElasticsearchPrefix()}resource",
    createIndex = false
)
@Mapping(mappingPath = "fr/inra/urgi/rare/domain/RareGeneticResource.mapping.json")
public final class RareIndexedGeneticResource implements IndexedGeneticResource<RareGeneticResource> {
    @JsonUnwrapped
    private final RareGeneticResource geneticResource;

    /**
     * The list of completion suggestions that are valid for this genetic resource.
     */
    private final List<String> suggestions;

    public RareIndexedGeneticResource(RareGeneticResource geneticResource) {
        this.geneticResource = geneticResource;

        List<String> list = new ArrayList<>();
        addIfNotBlank(list, geneticResource.getName());
        addIfNotBlank(list, geneticResource.getPillarName());
        addIfNotBlank(list, geneticResource.getDatabaseSource());
        addIfNotBlank(list, geneticResource.getDomain());
        addAllIfNotBlank(list, geneticResource.getTaxon());
        addAllIfNotBlank(list, geneticResource.getFamily());
        addAllIfNotBlank(list, geneticResource.getGenus());
        addAllIfNotBlank(list, geneticResource.getSpecies());
        addAllIfNotBlank(list, geneticResource.getMaterialType());
        addAllIfNotBlank(list, geneticResource.getBiotopeType());
        addIfNotBlank(list, geneticResource.getCountryOfOrigin());
        addIfNotBlank(list, geneticResource.getCountryOfCollect());
        IndexedGeneticResource.extractTokensOutOfDescription(geneticResource.getDescription()).forEach(list::add);

        this.suggestions = Collections.unmodifiableList(list);
    }

    public RareGeneticResource getGeneticResource() {
        return geneticResource;
    }

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
        RareIndexedGeneticResource that = (RareIndexedGeneticResource) o;
        return Objects.equals(geneticResource, that.geneticResource) &&
            Objects.equals(suggestions, that.suggestions);
    }

    @Override
    public int hashCode() {
        return Objects.hash(geneticResource, suggestions);
    }

    @Override
    public String toString() {
        return "RareIndexedGeneticResource{" +
            "geneticResource=" + geneticResource +
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
