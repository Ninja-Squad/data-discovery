package fr.inra.urgi.datadiscovery.dao.rare;

import static fr.inra.urgi.datadiscovery.dao.AppAggregation.Type.LARGE;

import fr.inra.urgi.datadiscovery.dao.AppAggregation;

/**
 * Enum listing the terms aggregations used by RARe, and their corresponding name and field.
 *
 * The order of the elements here is also the order of the aggregations in the UI. So don't change the order
 * unless you want to change the UI.
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
