package fr.inra.urgi.datadiscovery.filter.faidare;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import fr.inra.urgi.datadiscovery.config.AppProfile;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * The manager which loads and caches faidare users
 * @author JB Nizet
 */
@Component
@Profile(AppProfile.FAIDARE)
public class FaidareUserManager {
    private final LoadingCache<String, FaidareUser> cache;

    public FaidareUserManager(FaidareUserGroupsClient client) {
        this.cache = Caffeine.newBuilder()
                             .expireAfterWrite(Duration.ofHours(1))
                             .build(login -> {
                                 Set<Integer> accessibleGroupIds = client.loadUserGroups(login).block();
                                 // ensure 0 (= public) is always there
                                 Set<Integer> allAccessibleGroupIds = new HashSet<>(accessibleGroupIds);
                                 allAccessibleGroupIds.add(0);
                                 return new FaidareUser(login, allAccessibleGroupIds);
                             });
    }

    public FaidareUser getFaidareUser(String login) {
        try {
            return cache.get(login);
        } catch (Exception e) {
            return FaidareUser.ANONYMOUS;
        }
    }
}
