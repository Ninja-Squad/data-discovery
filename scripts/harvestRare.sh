#!/bin/bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

sh $BASEDIR/harvestCI.sh -app rare -env dev
