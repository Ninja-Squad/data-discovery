#!/bin/bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

sh $BASEDIR/harvestCI.sh localhost 8070 gnpis dev
