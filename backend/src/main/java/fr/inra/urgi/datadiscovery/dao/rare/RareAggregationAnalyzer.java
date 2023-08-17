package fr.inra.urgi.datadiscovery.dao.rare;

import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.AggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.AppAggregation;
import fr.inra.urgi.datadiscovery.dto.AggregationDTO;
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
    public AppAggregation.Type getAggregationType(String aggregationName) {
        return RareAggregation.fromName(aggregationName).getType();
    }

    @Override
    public Comparator<AggregationDTO> comparator() {
        return Comparator.comparing(aggregation -> RareAggregation.fromName(aggregation.getName()));
    }

    @Override
    public List<AppAggregation> getAggregations() {
        return AGGREGATIONS;
    }
}
