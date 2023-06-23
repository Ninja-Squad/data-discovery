package fr.inra.urgi.datadiscovery.dao.wheatis;

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
 * The {@link AggregationAnalyzer} implementation for the WheatIS application
 * @author JB Nizet
 */
@Component
@Profile({AppProfile.WHEATIS})
public class WheatisAggregationAnalyzer implements AggregationAnalyzer {
    private static final List<AppAggregation> AGGREGATIONS =
        Collections.unmodifiableList(Arrays.asList(WheatisAggregation.values()));

    @Override
    public AppAggregation.Type getAggregationType(String aggregationName) {
        return WheatisAggregation.fromName(aggregationName).getType();
    }

    @Override
    public Comparator<AggregationDTO> comparator() {
        return Comparator.comparing(aggregation -> WheatisAggregation.fromName(aggregation.getName()));
    }

    @Override
    public List<AppAggregation> getAggregations() {
        return AGGREGATIONS;
    }
}
