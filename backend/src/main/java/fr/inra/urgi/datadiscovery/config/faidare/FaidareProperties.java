package fr.inra.urgi.datadiscovery.config.faidare;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Faidare-specific properties
 * @author JB Nizet
 */
@ConfigurationProperties("data-discovery.faidare")
@Validated
public class FaidareProperties {
    /**
     * The URL of the Faidare app containing the Faidare documents, used to export germplasms
     */
    @NotBlank
    private String baseUrl;

    public FaidareProperties() {
    }

    public FaidareProperties(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
}
