package fr.inra.urgi.rare.dao.wheatis;

import static fr.inra.urgi.rare.dao.AppAggregation.Type.LARGE;
import static fr.inra.urgi.rare.dao.AppAggregation.Type.SMALL;

import java.util.stream.Stream;

import fr.inra.urgi.rare.dao.AppAggregation;

/**
 * Enum listing the terms aggregations used by WheatIS, and their corresponding name and field.
 *
 * The order of the elements here is also the order of the aggregations in the UI. So don't change the order
 * unless you want to change the UI.
 *
 * @author JB Nizet
 */
public enum WheatisAggregation implements AppAggregation {
    ENTRY_TYPE("entry", "entryType.keyword", SMALL),
    DATABASE_NAME("db", "databaseName.keyword", SMALL),
    NODE("node", "node.keyword", SMALL),
    SPECIES("species", "species.keyword", LARGE);

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
