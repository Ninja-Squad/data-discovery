package fr.inra.urgi.datadiscovery.dao;

import co.elastic.clients.elasticsearch.indices.IndexSettings;

/**
 * Utility class to load the settings from the resources
 * @author JB Nizet
 */
public class DocumentIndexSettings {
    public static IndexSettings createSettings(String profile) {
        String appName = profile.substring(0, profile.lastIndexOf("-"));
        return IndexSettings.of(
            builder ->
                builder.withJson(DocumentIndexSettings.class.getResourceAsStream(appName + "/settings.json"))
        );
    }
    public static IndexSettings createSuggestionsSettings() {
        return IndexSettings.of(
            builder ->
                builder.withJson(DocumentIndexSettings.class.getResourceAsStream("settings-suggestions.json"))
        );
    }
}
