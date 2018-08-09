package fr.inra.urgi.rare.domain;

import java.io.IOException;
import java.io.StringReader;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import org.apache.lucene.analysis.standard.StandardTokenizer;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
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

    /**
     * Uses the standard tokenizer of Lucene (which is itself used by ElasticSearch) to tokenize the description.
     * This makes sure that words in the index used by the full-text search are the same as the ones in the suggestions,
     * used to autocomplete terms. Othwerwise, we could have suggestions that lead to no search result.
     * Note that words that are less than 3 characters-long are excluded from the suggestions, since it doesn't make
     * much sense to suggest those words, and since the UI only starts suggesting after 2 characters anyway.
     */
    private Stream<String> extractTokensOutOfDescription(String description) {
        if (description == null) {
            return Stream.empty();
        }

        try (StandardTokenizer tokenizer = new StandardTokenizer()) {
            tokenizer.setReader(new StringReader(description));
            CharTermAttribute termAttribute = tokenizer.addAttribute(CharTermAttribute.class);

            tokenizer.reset();

            List<String> terms = new ArrayList<>();
            while (tokenizer.incrementToken()) {
                String word = termAttribute.toString();
                if (word.length() > 2) {
                    terms.add(word);
                }
            }

            tokenizer.end();

            return terms.stream();
        }
        catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
