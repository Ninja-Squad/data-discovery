package fr.inra.urgi.datadiscovery.dao;

import java.io.IOException;
import java.io.UncheckedIOException;

import org.elasticsearch.common.settings.Settings;

/**
 * Utility class to load the settings from the resources
 * @author JB Nizet
 */
public class DocumentIndexSettings {
    public static String createSettings(String profile) {
        try {
            String appName = profile.substring(0, profile.lastIndexOf("-"));
            appName = profile.equals("data-discovery-app") ? "wheatis" : appName;
            return Settings.builder().loadFromStream(
                    appName + "/settings.json",
                    DocumentIndexSettings.class.getResourceAsStream(appName + "/settings.json"),
                    true
            ).build().toString();
        }
        catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
    public static String createSuggestionsSettings() {
        try {
            return Settings.builder().loadFromStream(
                    "settings-suggestions.json",
                    DocumentIndexSettings.class.getResourceAsStream("settings-suggestions.json"),
                    true
            ).build().toString();
        }
        catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
