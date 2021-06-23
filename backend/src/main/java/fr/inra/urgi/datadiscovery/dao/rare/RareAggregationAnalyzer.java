package fr.inra.urgi.datadiscovery.dao.rare;

import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.AggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.AggregationSelection;
import fr.inra.urgi.datadiscovery.dao.AppAggregation;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * The {@link AggregationAnalyzer} implementation for the RARe application
 * @author JB Nizet
 */
@Component
@Profile({AppProfile.RARE, AppProfile.BRC4ENV})
public class RareAggregationAnalyzer implements AggregationAnalyzer {
    private static final List<AppAggregation> AGGREGATIONS =
        Collections.unmodifiableList(Arrays.asList(RareAggregation.values()));

    @Override
    public AppAggregation.Type getAggregationType(Terms terms) {
        return RareAggregation.fromName(terms.getName()).getType();
    }

    @Override
    public Comparator<Terms> comparator(AggregationSelection aggregationSelection) {
        return Comparator.comparing(terms -> RareAggregation.fromName(terms.getName()));
    }

    @Override
    public List<AppAggregation> getAggregations() {
        return AGGREGATIONS;
    }
}
