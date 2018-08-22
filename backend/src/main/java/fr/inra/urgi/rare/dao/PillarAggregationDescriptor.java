package fr.inra.urgi.rare.dao;

/**
 * A descriptor allowing to create the pillars aggregation, based on the schema of the specific schema of the genetic
 * resource
 * @author JB Nizet
 */
public final class PillarAggregationDescriptor {

    /**
     * The name of the property containing the "pillar name". Mandatory.
     */
    private final String pillarNameProperty;

    /**
     * The name of the property containing the "database source". Mandatory.
     */
    private final String databaseSourceProperty;

    /**
     * The name of the property containing the "portal URL". Optional. If null, no aggregation for the portal URL is
     * created.
     */
    private final String portalUrlProperty;

    public PillarAggregationDescriptor(String pillarNameProperty,
                                       String databaseSourceProperty,
                                       String portalUrlProperty) {
        this.pillarNameProperty = pillarNameProperty;
        this.databaseSourceProperty = databaseSourceProperty;
        this.portalUrlProperty = portalUrlProperty;
    }

    public String getPillarNameProperty() {
        return pillarNameProperty;
    }

    public String getDatabaseSourceProperty() {
        return databaseSourceProperty;
    }

    public String getPortalUrlProperty() {
        return portalUrlProperty;
    }
}
