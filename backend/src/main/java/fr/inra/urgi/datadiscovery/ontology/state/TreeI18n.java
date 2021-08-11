package fr.inra.urgi.datadiscovery.ontology.state;

import java.util.Map;

/**
 * The internationalized text for all the nodes of the ontology tree, in a specific language
 * @author JB Nizet
 */
public final class TreeI18n {
    private final String language;
    private final Map<TreeNodeType, Map<String, String>> names;

    public TreeI18n(String language, Map<TreeNodeType, Map<String, String>> names) {
        this.language = language;
        this.names = names;
    }

    public String getLanguage() {
        return language;
    }

    public Map<TreeNodeType, Map<String, String>> getNames() {
        return names;
    }
}
