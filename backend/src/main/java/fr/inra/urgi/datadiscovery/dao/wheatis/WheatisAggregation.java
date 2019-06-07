package fr.inra.urgi.datadiscovery.dao.wheatis;

import java.util.stream.Stream;

import fr.inra.urgi.datadiscovery.dao.AppAggregation;

import static fr.inra.urgi.datadiscovery.dao.AppAggregation.Type.LARGE;
import static fr.inra.urgi.datadiscovery.dao.AppAggregation.Type.SMALL;

/**
 * Enum listing the terms aggregations used by WheatIS, and their corresponding name and field.
 *
 * The order of the elements here is also the order of the aggregations in the UI. So don't change the order
 * unless you want to change the UI.
 *
 * @author JB Nizet
 */
public enum WheatisAggregation implements AppAggregation {
    SPECIES("species", "species.keyword", LARGE),
    ENTRY_TYPE("entry", "entryType.keyword", LARGE),
    DATABASE_NAME("db", "databaseName.keyword", LARGE),
    NODE("node", "node.keyword", SMALL);

    private final String name;
    private final String field;
    private final AppAggregation.Type type;

    WheatisAggregation(String name, String field, AppAggregation.Type type) {
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
    public AppAggregation.Type getType() {
        return type;
    }

    public static WheatisAggregation fromName(String name) {
        return Stream.of(WheatisAggregation.values())
                     .filter(ra -> ra.getName().equals(name))
                     .findAny()
                     .orElseThrow(() -> new IllegalArgumentException("Unknown WheatisAggregation name: " + name));
    }
}
