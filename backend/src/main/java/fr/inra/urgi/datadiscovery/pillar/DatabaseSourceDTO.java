package fr.inra.urgi.datadiscovery.pillar;

import java.util.List;
import java.util.Objects;

import co.elastic.clients.elasticsearch._types.aggregations.Aggregate;
import co.elastic.clients.elasticsearch._types.aggregations.StringTermsBucket;
import fr.inra.urgi.datadiscovery.dao.DocumentDao;

/**
 * A database source (name, URL and document count), part of a {@link PillarDTO}
 * @author JB Nizet
 */
public final class DatabaseSourceDTO {
    private final String name;
    private final String url;
    private final long documentCount;

    public DatabaseSourceDTO(String name, String url, long documentCount) {
        this.name = name;
        this.url = url;
        this.documentCount = documentCount;
    }

    public static DatabaseSourceDTO fromDatabaseSourceBucket(StringTermsBucket bucket) {
        String name = bucket.key().stringValue();
        return new DatabaseSourceDTO(name, getPortalUrl(bucket), bucket.docCount());
    }

    private static String getPortalUrl(StringTermsBucket bucket) {
        Aggregate portalURLAggregate =
            bucket.aggregations().get(DocumentDao.PORTAL_URL_AGGREGATION_NAME);

        if (portalURLAggregate != null) {
            List<StringTermsBucket> buckets = portalURLAggregate.sterms().buckets().array();

            // there should be 0 bucket (if the database source has no portal URL), or 1 if it has one.
            // if there are more, we only take the first one, which has the most documents: it probably means
            // that the other buckets have a wrong URL
            return buckets.size() > 0 ? buckets.get(0).key().stringValue() : null;
        }
        return null;
    }

    public String getName() {
        return name;
    }

    public String getUrl() {
        return url;
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
        DatabaseSourceDTO that = (DatabaseSourceDTO) o;
        return documentCount == that.documentCount &&
            Objects.equals(name, that.name) &&
            Objects.equals(url, that.url);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, url, documentCount);
    }

    @Override
    public String toString() {
        return "DatabaseSourceDTO{" +
            "name='" + name + '\'' +
            ", url='" + url + '\'' +
            ", documentCount=" + documentCount +
            '}';
    }
}
