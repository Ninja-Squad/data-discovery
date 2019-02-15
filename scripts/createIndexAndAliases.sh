#!/bin/bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

# RARe index/alias
sh $BASEDIR/createIndexAndAliases4CI.sh -host localhost -app rare -env dev

# WheatIS index/alias
sh $BASEDIR/createIndexAndAliases4CI.sh -host localhost -app wheatis -env dev

# GnpIS index/alias
sh $BASEDIR/createIndexAndAliases4CI.sh -host localhost -app gnpis -env dev
