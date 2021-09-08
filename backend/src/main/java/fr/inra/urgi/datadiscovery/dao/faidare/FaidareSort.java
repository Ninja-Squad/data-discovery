package fr.inra.urgi.datadiscovery.dao.faidare;

import org.springframework.data.domain.Sort;

/**
 * The sort criteria supported by Faidare
 * @author JB Nizet
 */
public enum FaidareSort {
    NAME("name", "name.keyword"),
    // FIXME: what is the field associated with accession number?
    ACCESSION_NUMBER("accession", "name.keyword"),
    SPECIES("species", "species.keyword"),
    INSTITUTE("institute", "holdingInstitute.keyword"),
    BOLOGICAL_STATUS("biological-status", "biologicalStatus.keyword"),
    COUNTRY_OF_ORIGIN("country", "countryOfOrigin.keyword");

    private final String name;
    private final String field;

    FaidareSort(String name, String field) {
        this.name = name;
        this.field = field;
    }

    public String getName() {
        return name;
    }

    public Sort toSort(Sort.Direction direction) {
        return Sort.by(direction, this.field);
    }
}
