package fr.inra.urgi.datadiscovery.domain.faidare;

/**
 * A geographic location of a faidare document (partial, containing only the
 * information needed by the frontend)
 * @author JB Nizet
 */
public record GeographicLocation(
    double latitude,
    double longitude
) {
}
