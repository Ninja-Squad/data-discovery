package fr.inra.urgi.datadiscovery.dao.rare;

import static fr.inra.urgi.datadiscovery.dao.AppAggregation.Type.LARGE;

import fr.inra.urgi.datadiscovery.dao.AppAggregation;

/**
 * Enum listing the implicit terms aggregations used by RARe, and their corresponding name and field.
 * These terms and their values are automatically added to any search, aggregation and pillar requests.
 *
 * Their values are specified via the application.yml, for example:
 * rare:
 *   implicit-terms:
 *     PILLAR:
 *       - Pilier Forêt
 *       - Pilier Micro-organisme
 *
 * @author JB Nizet
 */
public enum RareImplicitAggregation implements AppAggregation {
    PILLAR("pillar", "pillarName.keyword", LARGE);

    private final String name;
    private final String field;
    private final Type type;

    RareImplicitAggregation(String name, String field, Type type) {
        this.name = name;
        this.field = field;
        this.type = type;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getField() {
        return field;
    }

    @Override
    public Type getType() {
        return type;
    }
}
