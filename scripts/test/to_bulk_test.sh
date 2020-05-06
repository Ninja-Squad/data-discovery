#!/bin/bash

curdir=$(dirname $0)
JQ_SCRIPT=$(dirname $curdir)/to_bulk.jq
test_dir=$(mktemp -d)
nb_fail=0
echo "Working into $test_dir"
for fixture in $curdir/fixture*.json ; do
    result_out="$test_dir/$(basename $fixture .json).stdout"
    result_err="$test_dir/$(basename $fixture .json).stderr"
    cat $fixture | ID_FIELD="name" jq -c -f "$JQ_SCRIPT" >$result_out 2>$result_err

    # Compare stdout
    diff --color=always "$fixture.stdout" $result_out > $result_out.diff
    [ $? != 0 ] && { echo -e "FAILED processing $(basename $fixture) stdout: \n\t" $(cat $result_out.diff); nb_fail=$((nb_fail+1)) ; }

    # Compare stderr
    diff --color=always "$fixture.stderr" $result_err > $result_err.diff
    [ $? != 0 ] && { echo -e "FAILED processing $(basename $fixture) stderr: \n\t" $(cat $result_err.diff) ; nb_fail=$((nb_fail+1)) ; }
done

if [ $nb_fail != 0 ]; then
    echo "$nb_fail test(s) failed." && exit $nb_fail
else
    echo "Success, no test failed." && exit 0
fi