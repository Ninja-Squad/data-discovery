package fr.inra.urgi.datadiscovery.dao.gnpis;

import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.AggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.AppAggregation;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * The {@link AggregationAnalyzer} implementation for the GnpIS application
 * @author JB Nizet
 */
@Component
@Profile(AppProfile.GNPIS)
public class GnpisAggregationAnalyzer implements AggregationAnalyzer {
    private static final List<AppAggregation> AGGREGATIONS =
        Collections.unmodifiableList(Arrays.asList(GnpisAggregation.values()));

    @Override
    public AppAggregation.Type getAggregationType(Terms terms) {
        return GnpisAggregation.fromName(terms.getName()).getType();
    }

    @Override
    public Comparator<Terms> comparator() {
        return Comparator.comparing(terms -> GnpisAggregation.fromName(terms.getName()));
    }

    @Override
    public List<AppAggregation> getAggregations() {
        return AGGREGATIONS;
    }
}
