package fr.inra.urgi.datadiscovery.config;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import fr.inra.urgi.datadiscovery.dao.rare.RareImplicitAggregation;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Profile;

@Profile({AppProfile.RARE, AppProfile.BRC4ENV})
@ConfigurationProperties(prefix = "rare")
public class RareImplicitRefinementsProperties {
    private Map<RareImplicitAggregation, Set<String>> implicitTerms = new HashMap<>();

    public Map<RareImplicitAggregation, Set<String>> getImplicitTerms() {
        return implicitTerms;
    }

    public void setImplicitTerms(Map<RareImplicitAggregation, Set<String>> implicitTerms) {
        this.implicitTerms = implicitTerms;
    }

    @Override
    public String toString() {
        return "RareImplicitRefinementsProperties{" +
                "implicitTerms=" + implicitTerms +
                '}';
    }
}
