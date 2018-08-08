#!/bin/bash

BASEDIR=$(dirname "$0")

curl -X PUT "localhost:9200/resource-physical-index" -H 'Content-Type: application/json' -d'
{
    "aliases" : {
        "resource-index" : {},
        "resource-harvest-index" : {}
    }
}
'
