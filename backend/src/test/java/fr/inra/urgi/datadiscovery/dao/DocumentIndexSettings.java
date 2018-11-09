package fr.inra.urgi.datadiscovery.dao;

import java.io.IOException;
import java.io.UncheckedIOException;

import org.elasticsearch.common.settings.Settings;

/**
 * Utility class to load the settings from the resources
 * @author JB Nizet
 */
public class DocumentIndexSettings {
    public static String createSettings() {
        try {
            return Settings.builder().loadFromStream(
                "settings.json",
                DocumentIndexSettings.class.getResourceAsStream("settings.json"),
                true
            ).build().toString();
        }
        catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
