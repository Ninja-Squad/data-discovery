package fr.inra.urgi.datadiscovery.search;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;

/**
 * A mock implementation of a Terms aggregation
 * @author JB Nizet
 */
public final class MockTermsAggregation implements Terms {
    private final String name;
    private final List<Bucket> buckets;

    public MockTermsAggregation(String name, List<Bucket> buckets) {
        this.name = name;
        this.buckets = buckets;
    }

    @Override
    public String getName() {
        return this.name;
    }

    @Override
    public List<? extends Bucket> getBuckets() {
        return buckets;
    }

    @Override
    public Bucket getBucketByKey(String term) {
        throw new UnsupportedOperationException();
    }

    @Override
    public long getDocCountError() {
        throw new UnsupportedOperationException();
    }

    @Override
    public long getSumOfOtherDocCounts() {
        throw new UnsupportedOperationException();
    }

    @Override
    public String getType() {
        throw new UnsupportedOperationException();
    }

    @Override
    public Map<String, Object> getMetadata() {
        return null;
    }

    @Override
    public XContentBuilder toXContent(XContentBuilder builder, Params params) throws IOException {
        throw new UnsupportedOperationException();
    }
}
