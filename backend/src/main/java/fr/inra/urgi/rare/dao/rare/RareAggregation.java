package fr.inra.urgi.rare.dao.rare;

import static fr.inra.urgi.rare.dao.AppAggregation.Type.LARGE;
import static fr.inra.urgi.rare.dao.AppAggregation.Type.SMALL;

import java.util.stream.Stream;

import fr.inra.urgi.rare.dao.AppAggregation;

/**
 * Enum listing the terms aggregations used by RARe, and their corresponding name and field.
 *
 * The order of the elements here is also the order of the aggregations in the UI. So don't change the order
 * unless you want to change the UI.
 *
 * @author JB Nizet
 */
public enum RareAggregation implements AppAggregation {
    DOMAIN("domain", "domain.keyword", SMALL),
    TAXON("taxon", "taxon.keyword", LARGE),
    MATERIAL("material", "materialType.keyword", SMALL),
    COUNTRY_OF_ORIGIN("coo", "countryOfOrigin.keyword", SMALL),
    COUNTRY_OF_COLLECT("coc", "countryOfCollect.keyword", LARGE),
    BIOTOPE("biotope", "biotopeType.keyword", SMALL);

    private final String name;
    private final String field;
    private final Type type;

    RareAggregation(String name, String field, Type type) {
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

    public static RareAggregation fromName(String name) {
        return Stream.of(RareAggregation.values())
                     .filter(ra -> ra.getName().equals(name))
                     .findAny()
                     .orElseThrow(() -> new IllegalArgumentException("Unknown RareAggregation name: " + name));
    }
}
