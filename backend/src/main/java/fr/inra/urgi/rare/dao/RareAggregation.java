package fr.inra.urgi.rare.dao;

/**
 * Enum listing the terms aggregations used by RARe, and their corresponding name and field
 * @author JB Nizet
 */
public enum RareAggregation {
    DOMAIN("domain", "domain.keyword"),
    BIOTOPE("biotope", "biotopeType.keyword"),
    MATERIAL("material", "materialType.keyword"),
    COUNTRY_OF_ORIGIN("coo", "countryOfOrigin.keyword");

    private final String name;
    private final String field;

    RareAggregation(String name, String field) {
        this.name = name;
        this.field = field;
    }

    public String getName() {
        return name;
    }

    public String getField() {
        return field;
    }
}
