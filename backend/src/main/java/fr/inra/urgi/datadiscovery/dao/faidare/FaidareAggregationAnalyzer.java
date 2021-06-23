package fr.inra.urgi.datadiscovery.dao.faidare;

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
 * The {@link AggregationAnalyzer} implementation for the Faidare application
 * @author JB Nizet
 */
@Component
@Profile({AppProfile.FAIDARE})
public class FaidareAggregationAnalyzer implements AggregationAnalyzer {
    private static final List<AppAggregation> AGGREGATIONS =
        Collections.unmodifiableList(Arrays.asList(FaidareAggregation.values()));

    @Override
    public AppAggregation.Type getAggregationType(Terms terms) {
        return FaidareAggregation.fromName(terms.getName()).getType();
    }

    @Override
    public Comparator<Terms> comparator(AggregationSelection aggregationSelection) {
        if (aggregationSelection == AggregationSelection.ALL) {
            return Comparator.comparing(terms -> FaidareAggregation.fromName(terms.getName()));
        } else if (aggregationSelection == AggregationSelection.MAIN) {
            return Comparator.comparingInt(terms -> {
                FaidareAggregation faidareAggregation = FaidareAggregation.fromName(terms.getName());
                return FaidareAggregation.MAIN_AGGREGATIONS.indexOf(faidareAggregation);
            });
        } else {
            throw new IllegalStateException("Unhandled aggregation selection: " + aggregationSelection);
        }
    }

    @Override
    public List<AppAggregation> getAggregations() {
        return AGGREGATIONS;
    }
}
