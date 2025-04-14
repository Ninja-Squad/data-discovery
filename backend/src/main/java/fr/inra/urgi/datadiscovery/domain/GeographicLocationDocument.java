package fr.inra.urgi.datadiscovery.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

import java.util.Objects;

public final class GeographicLocationDocument {

    private final String siteId;

    private final String siteName;

    private final String siteType;

    private GeoPoint coordinates;


    @JsonCreator
    public GeographicLocationDocument(String siteId, String siteName, String siteType, GeoPoint coordinates) {
        this.siteId = siteId;
        this.siteName = siteName;
        this.siteType = siteType;
        this.coordinates = coordinates;
    }

    public String getSiteId() {
        return siteId;
    }

    public String getSiteName() {
        return siteName;
    }

    public String getSiteType() {
        return siteType;
    }

    public GeoPoint getCoordinates() {
        return coordinates;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GeographicLocationDocument that = (GeographicLocationDocument) o;
        return Objects.equals(siteId, that.siteId) && Objects.equals(siteName, that.siteName) && Objects.equals(siteType, that.siteType) && Objects.equals(coordinates, that.coordinates);
    }

    @Override
    public int hashCode() {
        return Objects.hash(siteId, siteName, siteType, coordinates);
    }

    @Override
    public String toString() {
        return "GeographicLocationDocument{" +
                "siteId='" + siteId + '\'' +
                ", siteName='" + siteName + '\'' +
                ", siteType='" + siteType + '\'' +
                ", coordinates=" + coordinates +
                '}';
    }
}
