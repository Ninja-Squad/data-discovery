package fr.inra.urgi.rare.config;

import java.nio.file.Path;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties class holding the rare-specific properties of the application (typically stored in application.yml)
 * @author JB Nizet
 */
@ConfigurationProperties(prefix = "rare")
public class RareProperties {

    /**
     * The directory where the JSON files that are harvested are located.
     */
    private Path resourceDir;

    public Path getResourceDir() {
        return resourceDir;
    }

    public void setResourceDir(Path resourceDir) {
        this.resourceDir = resourceDir;
    }

    @Override
    public String toString() {
        return "RareProperties{" +
            "resourceDir=" + resourceDir +
            '}';
    }
}
