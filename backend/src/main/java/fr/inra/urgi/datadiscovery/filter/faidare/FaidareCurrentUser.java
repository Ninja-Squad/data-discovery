package fr.inra.urgi.datadiscovery.filter.faidare;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

/**
 * The request-scoped Faidare current user, populated from the basic auth header by {@link FaidareAuthenticationFilter},
 * and used by the Faidare repository to filter documents.
 * @author JB Nizet
 */
@Component
@Profile(AppProfile.FAIDARE)
@RequestScope
public class FaidareCurrentUser {
    private FaidareUser user;

    void set(FaidareUser user) {
        this.user = user;
    }

    public FaidareUser get() {
        return user;
    }
}
