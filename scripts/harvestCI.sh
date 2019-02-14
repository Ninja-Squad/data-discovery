#!/bin/bash
# set -x


help() {
	cat <<EOF
DESCRIPTION: 
	Script used to index data in Data Discovery portals (RARe, WheatIS and GnpIS)

USAGE:
	$0 -host <host name> -port <port value> -app <application name> -env <environment name> -copy [-h|--help]

PARAMS:
	-host          the host name of the targeted application
	-port          the port value of the targeted application
	-app           the name of the targeted application: rare, wheatis or gnpis
	-env           the environement name of the targeted application (dev, beta, prod ...)
	-copy          to set if the data files needs to be copied on the application host
	-h or --help   print this help

EOF
	exit 1
}

BASEDIR=$(dirname "$0")
APP_HOST=""
APP_PORT=""
APP_NAME=""
ENV=""
COPY_FILES=0

# any params
[ -z "$1" ] && echo && help

# get params
while [ -n "$1" ]; do
	case $1 in
		-h) help;shift 1;;
		--help) help;shift 1;;
		-host) APP_HOST=$2;shift 2;;
		-port) APP_PORT=$2;shift 2;;
		-app) APP_NAME=$2;shift 2;;
		-env) ENV=$2;shift 2;;
		-copy) COPY_FILES=1;shift 1;;
		--) shift;break;;
		-*) echo "Unknown option: $1" && echo && help && echo;exit 1;;
		*) break;;
	esac
done

PARALLEL_FOUND=true
command -v parallel > /dev/null || PARALLEL_FOUND=false

EXP_PARAMS=4
[ ! $# -eq $EXP_PARAMS ] && {
    echo "ERROR: missing $((EXP_PARAMS-$#)) parameter(s)." && help
	exit 4
}

INDEX_DATA_DIR="/tmp/$APP_NAME-$ENV/resources"
if [ $COPY_FILES -eq 1 ]; then
    DATADIR="$BASEDIR/../data/$APP_NAME"
	echo "Creating index directory: $INDEX_DATA_DIR" && mkdir -p $INDEX_DATA_DIR
	echo "Decompressing data files from $DATADIR into $INDEX_DATA_DIR"
	if [ "$PARALLEL_FOUND" == "true" ]; then
		echo "... using GNU parallel"
		parallel --bar "gzip -d -f -c {} > $INDEX_DATA_DIR/{/.}" ::: $DATADIR/*.json.gz
	else
		echo "... sequentially"
		cp $DATADIR/*.json.gz $INDEX_DATA_DIR && \
		gzip -d -f $INDEX_DATA_DIR/*.json.gz
	fi
else
    echo "Decompressing data files from $INDEX_DATA_DIR"
    gzip -d -f $INDEX_DATA_DIR/*.json.gz
fi

{
	curl -f -i -X POST -u ${APP_NAME}:f01a7031fc17 \
	"http://${APP_HOST}:${APP_PORT}/${APP_NAME}-${ENV}/api/harvests"
} || {
	code=$?
	echo -e "A problem occured (code=$code) when trying to index data \n"\
		"\tfrom $INDEX_DATA_DIR\n"\
		"\ton app http://${APP_HOST}:${APP_PORT}/${APP_NAME}-${ENV}"
	exit $code
}
