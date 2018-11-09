package fr.inra.urgi.datadiscovery.dto;

import java.util.Objects;

import org.elasticsearch.search.aggregations.bucket.terms.Terms;

/**
 * A bucket, containing a field value and the number of documents falling into the bucket
 * @author JB Nizet
 */

public final class BucketDTO {
    private final String key;
    private final long documentCount;

    public BucketDTO(String key, long documentCount) {
        this.key = key;
        this.documentCount = documentCount;
    }

    public BucketDTO(Terms.Bucket bucket) {
        this(bucket.getKeyAsString(), bucket.getDocCount());
    }

    public String getKey() {
        return key;
    }

    public long getDocumentCount() {
        return documentCount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        BucketDTO bucketDTO = (BucketDTO) o;
        return documentCount == bucketDTO.documentCount &&
            Objects.equals(key, bucketDTO.key);
    }

    @Override
    public int hashCode() {
        return Objects.hash(key, documentCount);
    }

    @Override
    public String toString() {
        return "BucketDTO{" +
            "key='" + key + '\'' +
            ", documentCount=" + documentCount +
            '}';
    }
}
