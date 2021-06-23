package fr.inra.urgi.datadiscovery.dao;

import java.util.Comparator;
import java.util.List;

import fr.inra.urgi.datadiscovery.dao.AppAggregation.Type;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;

/**
 * Interface allowing to sort Terms aggregations and to get their type before sending them to the UI, and to get the
 * list of {@link AppAggregation}
 * @author JB Nizet
 */
public interface AggregationAnalyzer {
    Type getAggregationType(Terms terms);
    Comparator<Terms> comparator(AggregationSelection aggregationSelection);
    List<AppAggregation> getAggregations();
}
