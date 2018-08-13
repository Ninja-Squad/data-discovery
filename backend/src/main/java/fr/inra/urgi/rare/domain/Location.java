package fr.inra.urgi.rare.domain;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Our definition of an immutable GeoPoint. Note that the JSON name of the properties (lat and lon) is
 * mandatory in order for Elasticsearch to index it as a geo_point type.
 * @author JB Nizet
 */
public final class Location {

    /**
     * The latitude
     */
    private final double lat;

    /**
     * The longitude
     */
    private final double lon;

    @JsonCreator
    public Location(double lat, double lon) {
        this.lat = lat;
        this.lon = lon;
    }

    public double getLat() {
        return lat;
    }

    public double getLon() {
        return lon;
    }

    @Override
    public String toString() {
        return "Location{" +
            "lat=" + lat +
            ", lon=" + lon +
            '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Location location = (Location) o;
        return Double.compare(location.lat, lat) == 0 &&
            Double.compare(location.lon, lon) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(lat, lon);
    }
}
