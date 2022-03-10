package fr.inra.urgi.datadiscovery.filter.faidare;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ExecutionException;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import org.elasticsearch.common.cache.Cache;
import org.elasticsearch.common.cache.CacheBuilder;
import org.elasticsearch.core.TimeValue;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * The manager which loads and caches faidare users
 * @author JB Nizet
 */
@Component
@Profile(AppProfile.FAIDARE)
public class FaidareUserManager {
    private final Cache<String, FaidareUser> cache;
    private final FaidareUserGroupsClient client;

    public FaidareUserManager(FaidareUserGroupsClient client) {
        this.client = client;
        this.cache = CacheBuilder.<String, FaidareUser>builder()
                                 .setExpireAfterWrite(TimeValue.timeValueHours(1))
                                 .build();
    }

    public FaidareUser getFaidareUser(String login) {
        try {
            return cache.computeIfAbsent(login, key -> {
                Set<Integer> accessibleGroupIds = client.loadUserGroups(key).block();
                // ensure 0 (= public) is always there
                Set<Integer> allAccessibleGroupIds = new HashSet<>(accessibleGroupIds);
                allAccessibleGroupIds.add(0);
                return new FaidareUser(key, allAccessibleGroupIds);
            });
        } catch (ExecutionException e) {
            return FaidareUser.ANONYMOUS;
        }
    }
}
