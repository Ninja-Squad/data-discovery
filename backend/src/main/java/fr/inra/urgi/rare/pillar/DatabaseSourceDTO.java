package fr.inra.urgi.rare.pillar;

import java.util.Objects;

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
