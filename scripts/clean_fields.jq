#!/usr/bin/env jq -Mf

[.[] |                                              # iterate over each item of the input JSON array (destructure the array)
        [                                           # wrap all below process in an array for keeping consistency of each DD document (DD=DataDiscovery)
            ($fields[] as $ddkey |                  # iterate over each key (named $ddkey) found from mapping file
                {                                   # construct a new single field JSON object with the given ddkey, in the end will look like to { "databaseName": "IBET" } or { "name": "CICIHBETON" } according to the value of ddkey
                    ($ddkey?|tostring) :            # use current ddkey as key name, ie. "databaseName"
                    .[$ddkey?]                      # use value of the property named with the value of current ddkey
                }                                   # close the single value JSON document
                | select(.[$ddkey?] != null)        # select only document having a non-null value, ie. removing { "ancestors": null }
            ) 
        ]                                           # close the array, each document inside is single value JSON document
        | add                                       # merge all single value JSON objects related to one DD document to construct a full DD JSON document
]