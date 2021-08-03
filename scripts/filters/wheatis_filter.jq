#!/usr/bin/env jq -Mf

# Apply a filter to only select WheatIS documents

def filter_wheat_species:
# Filters the WheatIS document according to the .species value.
    select(
        if .species != null then
            .species | tostring |
            ascii_downcase | test("(triticum)|(hordeum)|(aegilops)|(wheat)")
        else
            false
        end
    )
;

[
    .[] | filter_wheat_species
]