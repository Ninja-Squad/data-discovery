package fr.inra.urgi.rare.search;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.search.aggregations.Aggregations;
import org.elasticsearch.search.aggregations.bucket.terms.Terms.Bucket;

/**
 * A mock implementation of {@link Bucket}
 * @author JB Nizet
 */
public final class MockBucket implements Bucket {

    private final String key;
    private final long docCount;

    public MockBucket(String key, long docCount) {
        this.key = key;
        this.docCount = docCount;
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
        throw new UnsupportedOperationException();
    }

    @Override
    public XContentBuilder toXContent(XContentBuilder builder, Params params) throws IOException {
        throw new UnsupportedEncodingException();
    }
}
