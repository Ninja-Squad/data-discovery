package fr.inra.urgi.datadiscovery.domain;

import java.io.IOException;
import java.io.StringReader;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.analysis.standard.StandardTokenizer;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;

/**
 * Interface common to all indexed documents that can be indexed and searched by this application.
 * One implementation exists for each app: one for Rare, one for WheatIS, etc.
 *
 * It contains all the fields of a {@link Document}, and additional fields used uniquely for indexing
 * and which thus make it possible or easier to implement completion suggestions.
 * @author JB Nizet
 */
public interface IndexedDocument<D extends Document> {
    /**
     * Returns the wrapped document
     */
    D getDocument();

    /**
     * Returns the list of suggestions to index for completion
     */
    List<String> getSuggestions();

    /**
     * Uses the standard tokenizer of Lucene (which is itself used by ElasticSearch) to tokenize the description.
     * This makes sure that words in the index used by the full-text search are the same as the ones in the suggestions,
     * used to autocomplete terms. Othwerwise, we could have suggestions that lead to no search result.
     *
     * Note that words that are less than 3 characters-long are excluded from the suggestions, since it doesn't make
     * much sense to suggest those words, and since the UI only starts suggesting after 2 characters anyway.
     *
     * Words which, after being lowercased, belong to the set of English stopwords, are also excluded.
     */
    static Stream<String> extractTokensOutOfDescription(String description) {
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
                if (word.length() > 2 && !EnglishAnalyzer.getDefaultStopSet().contains(word.toLowerCase(Locale.ENGLISH))) {
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
