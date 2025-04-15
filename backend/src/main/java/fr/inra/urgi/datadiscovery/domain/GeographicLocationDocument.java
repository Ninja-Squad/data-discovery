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
    private final double lat;

    /**
     * The longitude
     */
    private final double lon;

    @JsonCreator
    public GeographicLocationDocument(String siteId, String siteName, String siteType, double lat, double lon) {

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
    public double getLat() {
        return lat;
    }

    public double getLon() {
        return lon;
    }

    @Override
    public String toString() {
        return "GeographicLocationDocument{" +
                "siteId='" + siteId + '\'' +
                ", siteName='" + siteName + '\'' +
                ", siteType='" + siteType + '\'' +
                ", lat=" + lat +
                ", lon=" + lon +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GeographicLocationDocument geographicLocationDocument = (GeographicLocationDocument) o;
        return Double.compare(lat, geographicLocationDocument.lat) == 0 && Double.compare(lon, geographicLocationDocument.lon) == 0 && Objects.equals(siteId, geographicLocationDocument.siteId) && Objects.equals(siteName, geographicLocationDocument.siteName) && Objects.equals(siteType, geographicLocationDocument.siteType);
    }

    @Override
    public int hashCode() {
        return Objects.hash(siteId, siteName, siteType, lat, lon);
    }
}
