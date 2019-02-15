#!/bin/bash

help() {
	cat <<EOF
DESCRIPTION: 
	Script used to create index and aliases for Data Discovery portals (RARe, WheatIS and GnpIS)

USAGE:
	$0 -host <ES host> -port <ES port> -app <application name> -env <environment name> [-h|--help]

PARAMS:
	-host          the host name of the targeted elasticsearch cluster
	-port          the port value of the targeted elasticsearch cluster ($ES_PORT by default)
	-app           the name of the targeted application: rare, wheatis or gnpis
	-env           the environement name of the targeted application (dev, beta, prod ...)
	-h or --help   print this help

EOF
	exit 1
}

BASEDIR=$(dirname "$0")
ES_HOST=""
ES_PORT="9200"
APP_NAME=""
ENV=""

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
		--) shift;break;;
		-*) echo "Unknown option: $1" && echo && help && echo;exit 1;;
		*) break;;
	esac
done

if [ -z "$APP_HOST" ] || [ -z "$APP_PORT" ] || [ -z "$APP_NAME" ] || [ -z "ENV" ]; then
    echo "ERROR: host, port, app and env parameters are mandatory!"
    echo && help
	exit 4
fi

echo -e "\nCreate index: ${APP_NAME}-${ENV}-resource-physical-index"
curl -si -X PUT "${ES_HOST}:${ES_PORT}/${APP_NAME}-${ENV}-resource-physical-index"\
 -H 'Content-Type: application/json' -d"
{
    \"aliases\" : {
        \"${APP_NAME}-${ENV}-resource-index\" : {},
        \"${APP_NAME}-${ENV}-resource-harvest-index\" : {}
    },
    \"settings\":
        $(cat ${BASEDIR}/../backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/settings.json )
    }
}
"

MAPPING_PARTIAL_PATH="${APP_NAME}"
if [ "$APP_NAME" == "gnpis" ]; then
    MAPPING_PARTIAL_PATH="wheatis" # needed to avoid duplicate mapping.json file between WheatIS and GnpISs
fi
echo -e "\n\nApply mapping: $(ls -1 ${BASEDIR}/../backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/${MAPPING_PARTIAL_PATH}/*.mapping.json)"
curl -si -X PUT "${ES_HOST}:${ES_PORT}/${APP_NAME}-${ENV}-resource-physical-index/_mapping/${APP_NAME}-${ENV}-resource"\
 -H 'Content-Type: application/json' -d"
$(cat ${BASEDIR}/../backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/${MAPPING_PARTIAL_PATH}/*.mapping.json)
"
echo
