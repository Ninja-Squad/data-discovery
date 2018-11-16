package fr.inra.urgi.datadiscovery.dao.wheatis;

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
 * The {@link AggregationAnalyzer} implementation for the WheatIS application
 * @author JB Nizet
 */
@Component
@Profile({AppProfile.WHEATIS, AppProfile.GNPIS})
public class WheatisAggregationAnalyzer implements AggregationAnalyzer {
    private static final List<AppAggregation> AGGREGATIONS =
        Collections.unmodifiableList(Arrays.asList(WheatisAggregation.values()));

    @Override
    public AppAggregation.Type getAggregationType(Terms terms) {
        return WheatisAggregation.fromName(terms.getName()).getType();
    }

    @Override
    public Comparator<Terms> comparator() {
        return Comparator.comparing(terms -> WheatisAggregation.fromName(terms.getName()));
    }

    @Override
    public List<AppAggregation> getAggregations() {
        return AGGREGATIONS;
    }
}
