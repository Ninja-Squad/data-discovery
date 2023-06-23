package fr.inra.urgi.datadiscovery.ontology;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Properties for ontology-related beans
 * @author JB Nizet
 */
@ConfigurationProperties("data-discovery.ontology")
@Validated
public class OntologyProperties {
    /**
     * The base URL of the BrApi API. URLs are composed using, for example <code>[baseUrl]/v1/variables</code>>
     */
    @NotBlank
    private String baseUrl;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
}
