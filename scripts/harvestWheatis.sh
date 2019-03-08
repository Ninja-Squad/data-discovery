#!/bin/bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

sh $BASEDIR/harvestCI.sh -url http://localhost:8180/wheatis-dev -app wheatis -env dev -copy
