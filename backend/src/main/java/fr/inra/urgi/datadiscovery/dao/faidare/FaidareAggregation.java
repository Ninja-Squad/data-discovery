package fr.inra.urgi.datadiscovery.dao.faidare;

import static fr.inra.urgi.datadiscovery.dao.AppAggregation.Type.LARGE;
import static fr.inra.urgi.datadiscovery.dao.AppAggregation.Type.SMALL;

import java.util.stream.Stream;

import fr.inra.urgi.datadiscovery.dao.AppAggregation;

/**
 * Enum listing the terms aggregations used by Faidare, and their corresponding name and field.
 *
 * The order of the elements here is also the order of the aggregations in the UI. So don't change the order
 * unless you want to change the UI.
 *
 * @author JB Nizet
 */
public enum FaidareAggregation implements AppAggregation {
    SPECIES("species", "species.keyword", LARGE),
    ENTRY_TYPE("entry", "entryType.keyword", LARGE),
    GO_ANNOTATION("annot", "annotationName.keyword", LARGE),
    DATABASE_NAME("db", "databaseName.keyword", LARGE),
    NODE("node", "node.keyword", SMALL);

    private final String name;
    private final String field;
    private final Type type;

    FaidareAggregation(String name, String field, Type type) {
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

    public static FaidareAggregation fromName(String name) {
        return Stream.of(FaidareAggregation.values())
                     .filter(ra -> ra.getName().equals(name))
                     .findAny()
                     .orElseThrow(() -> new IllegalArgumentException("Unknown FaidareAggregation name: " + name));
    }
}
