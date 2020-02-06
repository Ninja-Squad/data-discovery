package fr.inra.urgi.datadiscovery.dao;

import java.io.IOException;
import java.io.UncheckedIOException;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import org.elasticsearch.common.settings.Settings;

/**
 * Utility class to load the settings from the resources
 * @author JB Nizet
 */
public class DocumentIndexSettings {
    public static String createSettings(String profile) {
        try {
            String appName = AppProfile.RARE.equals(profile) ? "rare" : "wheatis";
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
