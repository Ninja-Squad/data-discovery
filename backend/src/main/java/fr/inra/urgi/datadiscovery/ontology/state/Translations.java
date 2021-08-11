package fr.inra.urgi.datadiscovery.ontology.state;

import java.util.HashMap;
import java.util.Map;

import fr.inra.urgi.datadiscovery.ontology.OntologyService;

/**
 * The translations of a node details in various languages
 * @author JB Nizet
 */
public final class Translations<T> {

    private static final String FIRST_BACKUP_LANGUAGE = OntologyService.DEFAULT_LANGUAGE;
    private static final String SECOND_BACKUP_LANGUAGE = null;
    private static final String THIRD_BACKUP_LANGUAGE = "FR";

    private final Map<String, T> translations = new HashMap<>();

    public Translations() {
    }

    public void putTranslation(String language, T translation) {
        translations.put(language, translation);
    }

    public T forLanguage(String language) {
        T result = translations.get(language);
        if (result == null) {
            result = translations.get(FIRST_BACKUP_LANGUAGE);
        }
        if (result == null) {
            result = translations.get(SECOND_BACKUP_LANGUAGE);
        }
        if (result == null) {
            result = translations.get(THIRD_BACKUP_LANGUAGE);
        }
        if (result == null) {
            result = translations.values().iterator().next();
        }
        return result;
    }
}
