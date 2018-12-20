package fr.inra.urgi.datadiscovery.harvest;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;

/**
 * DTO used when listing the harvest results
 * @author JB Nizet
 */
public final class LightHarvestResultDTO {
    private final String id;
    private final String url;
    private final Instant startInstant;
    private final Instant endInstant;
    private final Duration duration;

    public LightHarvestResultDTO(String id, String url, Instant startInstant, Instant endInstant, Duration duration) {
        this.id = id;
        this.url = url;
        this.startInstant = startInstant;
        this.endInstant = endInstant;
        this.duration = duration;
    }

    public String getId() {
        return id;
    }

    public String getUrl() {
        return url;
    }

    public Instant getStartInstant() {
        return startInstant;
    }

    public Instant getEndInstant() {
        return endInstant;
    }

    public Duration getDuration() { return duration; }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        LightHarvestResultDTO that = (LightHarvestResultDTO) o;
        return Objects.equals(id, that.id) &&
            Objects.equals(url, that.url) &&
            Objects.equals(startInstant, that.startInstant) &&
            Objects.equals(endInstant, that.endInstant);
    }

    @Override
    public int hashCode() {

        return Objects.hash(id, url, startInstant, endInstant, duration);
    }

    @Override
    public String toString() {
        return "LightHarvestResultDTO{" +
            "id='" + id + '\'' +
            ", url='" + url + '\'' +
            ", startInstant=" + startInstant +
            ", endInstant=" + endInstant +
            ", duration=" + duration +
            '}';
    }

}
