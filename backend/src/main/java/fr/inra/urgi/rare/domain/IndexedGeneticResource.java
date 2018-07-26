package fr.inra.urgi.rare.domain;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import org.springframework.data.elasticsearch.annotations.Document;

/**
 * A class containing all the fields of a GeneticResource, and additional fields used uniquely for indexing
 * and which thus make it possible or easier to implement completion suggestions.
 * @author JB Nizet
 */
@Document(
    indexName = "#{@rareProperties.getElasticsearchPrefix()}resource-index",
    type = "#{@rareProperties.getElasticsearchPrefix()}resource",
    createIndex = false
)
public final class IndexedGeneticResource {
    private static final Pattern WORD_SPLIT_PATTERN = Pattern.compile("\\p{Punct}|\\p{Space}");

    @JsonUnwrapped
    private final GeneticResource geneticResource;

    /**
     * The list of completion suggestions that are valid for this genetic resource.
     */
    private final List<String> suggestions;

    public IndexedGeneticResource(GeneticResource geneticResource) {
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
        extractTokensOutOfDescription(geneticResource.getDescription()).forEach(list::add);

        this.suggestions = Collections.unmodifiableList(list);
    }

    public GeneticResource getGeneticResource() {
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
        IndexedGeneticResource that = (IndexedGeneticResource) o;
        return Objects.equals(geneticResource, that.geneticResource) &&
            Objects.equals(suggestions, that.suggestions);
    }

    @Override
    public int hashCode() {
        return Objects.hash(geneticResource, suggestions);
    }

    @Override
    public String toString() {
        return "IndexedGeneticResource{" +
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

    private Stream<String> extractTokensOutOfDescription(String description) {
        if (description == null) {
            return Stream.empty();
        }
        return WORD_SPLIT_PATTERN.splitAsStream(description)
            .filter(s -> s.length() >= 3);
    }
}
