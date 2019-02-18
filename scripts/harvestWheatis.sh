#!/bin/bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

sh $BASEDIR/harvestCI.sh localhost 8180 wheatis dev
