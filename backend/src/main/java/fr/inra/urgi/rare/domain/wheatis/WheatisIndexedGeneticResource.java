package fr.inra.urgi.rare.domain.wheatis;

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
 * The indexed genetic resource for the WheatIS application.
 * @author JB Nizet
 */
@Document(
    indexName = "#{@rareProperties.getElasticsearchPrefix()}resource-harvest-index",
    type = "#{@rareProperties.getElasticsearchPrefix()}resource",
    createIndex = false
)
@Mapping(mappingPath = "fr/inra/urgi/rare/domain/wheatis/WheatisGeneticResource.mapping.json")
public final class WheatisIndexedGeneticResource implements IndexedGeneticResource<WheatisGeneticResource> {
    @JsonUnwrapped
    private final WheatisGeneticResource geneticResource;

    /**
     * The list of completion suggestions that are valid for this genetic resource.
     */
    private final List<String> suggestions;

    public WheatisIndexedGeneticResource(WheatisGeneticResource geneticResource) {
        this.geneticResource = geneticResource;

        List<String> list = new ArrayList<>();
        addIfNotBlank(list, geneticResource.getId());
        addIfNotBlank(list, geneticResource.getEntryType());
        addIfNotBlank(list, geneticResource.getDatabaseName());
        addIfNotBlank(list, geneticResource.getNode());
        addAllIfNotBlank(list, geneticResource.getSpecies());
        IndexedGeneticResource.extractTokensOutOfDescription(geneticResource.getDescription()).forEach(list::add);

        this.suggestions = Collections.unmodifiableList(list);
    }

    @Override
    public WheatisGeneticResource getGeneticResource() {
        return geneticResource;
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
        WheatisIndexedGeneticResource that = (WheatisIndexedGeneticResource) o;
        return Objects.equals(geneticResource, that.geneticResource) &&
            Objects.equals(suggestions, that.suggestions);
    }

    @Override
    public int hashCode() {
        return Objects.hash(geneticResource, suggestions);
    }

    @Override
    public String toString() {
        return "WheatisIndexedGeneticResource{" +
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
