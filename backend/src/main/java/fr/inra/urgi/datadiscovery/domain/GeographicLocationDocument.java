package fr.inra.urgi.datadiscovery.domain;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Our definition of an immutable GeoPoint. Note that the JSON name of the properties (lat and lon) is
 * mandatory in order for Elasticsearch to index it as a geo_point type.
 * @author JB Nizet
 */
public final class GeographicLocationDocument {

    private final String siteId;

    private final String siteName;

    private final String siteType;

    /**
     * The latitude
     */
    private final Double lat;

    /**
     * The longitude
     */
    private final Double lon;

    @JsonCreator
    public GeographicLocationDocument(String siteId, String siteName, String siteType, Double lat, Double lon) {

        this.siteId = siteId;
        this.siteName = siteName;
        this.siteType = siteType;
        this.lat = lat;
        this.lon = lon;
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
    public Double getLat() {
        return lat;
    }

    public Double getLon() {
        return lon;
    }

    @Override
    public String toString() {
        return "GeographicLocationDocument{" +
                "lat=" + lat +
                ", siteId='" + siteId + '\'' +
                ", siteName='" + siteName + '\'' +
                ", siteType='" + siteType + '\'' +
                ", lon=" + lon +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        GeographicLocationDocument that = (GeographicLocationDocument) o;
        return Objects.equals(siteId, that.siteId) && Objects.equals(siteName, that.siteName) && Objects.equals(siteType, that.siteType) && Objects.equals(lat, that.lat) && Objects.equals(lon, that.lon);
    }

    @Override
    public int hashCode() {
        return Objects.hash(siteId, siteName, siteType, lat, lon);
    }
}
