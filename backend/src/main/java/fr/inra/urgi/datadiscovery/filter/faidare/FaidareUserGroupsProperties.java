package fr.inra.urgi.datadiscovery.filter.faidare;

import javax.validation.constraints.NotBlank;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;
import org.springframework.validation.annotation.Validated;

/**
 * The configuration properties used to configure where and how the user groups of the user should be fetched.
 * Note that even if there is no intention of filtering out by user groups, a user group and a token should be
 * provided, otherwise the application won't start.
 * @author JB Nizet
 */
@ConfigurationProperties("data-discovery.faidare.user-groups")
@Validated
public class FaidareUserGroupsProperties {
    @NotBlank
    private final String url;
    @NotBlank
    private final String token;

    @ConstructorBinding
    public FaidareUserGroupsProperties(String url, String token) {
        this.url = url;
        this.token = token;
    }

    public String getUrl() {
        return url;
    }

    public String getToken() {
        return token;
    }
}
