#!/bin/bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

# RARe index/alias
sh $BASEDIR/createIndexAndAliases4CI.sh localhost rare dev

# WheatIS index/alias
sh $BASEDIR/createIndexAndAliases4CI.sh localhost wheatis dev
