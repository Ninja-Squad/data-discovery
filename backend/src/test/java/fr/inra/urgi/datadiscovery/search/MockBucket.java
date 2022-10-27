package fr.inra.urgi.datadiscovery.search;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import org.elasticsearch.search.aggregations.Aggregations;
import org.elasticsearch.search.aggregations.bucket.terms.Terms.Bucket;
import org.elasticsearch.xcontent.XContentBuilder;

/**
 * A mock implementation of {@link Bucket}
 * @author JB Nizet
 */
public final class MockBucket implements Bucket {

    private final String key;
    private final long docCount;
    private final Aggregations aggregations;

    public MockBucket(String key, long docCount) {
        this(key, docCount, null);
    }

    public MockBucket(String key, long docCount, Aggregations subAggregations) {
        this.key = key;
        this.docCount = docCount;
        this.aggregations = subAggregations;
    }

    @Override
    public String getKeyAsString() {
        return this.key;
    }

    @Override
    public Object getKey() {
        return this.key;
    }

    @Override
    public long getDocCount() {
        return this.docCount;
    }

    @Override
    public Number getKeyAsNumber() {
        throw new UnsupportedOperationException();
    }

    @Override
    public long getDocCountError() {
        throw new UnsupportedOperationException();
    }

    @Override
    public Aggregations getAggregations() {
        return this.aggregations;
    }

    @Override
    public XContentBuilder toXContent(XContentBuilder builder, Params params) throws IOException {
        throw new UnsupportedEncodingException();
    }
}
