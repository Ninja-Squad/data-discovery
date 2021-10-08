package fr.inra.urgi.datadiscovery.filter.faidare;

import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * A faidare user, with its login and accessible group IDs
 * @author JB Nizet
 */
public class FaidareUser {

    public static final FaidareUser ANONYMOUS = new FaidareUser("anonymous", Collections.singleton(0));

    private final String login;
    private final Set<Integer> accessibleGroupIds;

    public FaidareUser(String login, Set<Integer> accessibleGroupIds) {
        this.login = login;
        this.accessibleGroupIds = Collections.unmodifiableSet(new HashSet<>(accessibleGroupIds));
    }

    public String getLogin() {
        return login;
    }

    public Set<Integer> getAccessibleGroupIds() {
        return accessibleGroupIds;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        FaidareUser that = (FaidareUser) o;
        return Objects.equals(login, that.login) && Objects.equals(accessibleGroupIds, that.accessibleGroupIds);
    }

    @Override
    public int hashCode() {
        return Objects.hash(login, accessibleGroupIds);
    }

    @Override
    public String toString() {
        return "FaidareUser{" +
            "login='" + login + '\'' +
            ", accessibleGroupIds=" + accessibleGroupIds +
            '}';
    }
}
