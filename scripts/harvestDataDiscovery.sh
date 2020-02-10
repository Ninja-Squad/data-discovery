#!/bin/bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

sh $BASEDIR/index.sh -app data-discovery --local
