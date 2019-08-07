#!/bin/bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

sh $BASEDIR/harvestCI.sh -app wheatis -env dev
