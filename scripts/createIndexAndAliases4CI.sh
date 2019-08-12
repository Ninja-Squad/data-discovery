#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BOLD='\033[1m'
RED_BOLD="${RED}${BOLD}"
NC='\033[0m' # No format

help() {
	cat <<EOF
DESCRIPTION: 
	Script used to create index and aliases for Data Discovery portals (RARe, WheatIS and DataDiscovery)

USAGE:
	$0 -host <ES host> -port <ES port> -app <application name> -env <environment name> [-h|--help]

PARAMS:
	-host          the host name of the targeted Elasticsearch endpoint
	-port          the port value of the targeted Elasticsearch endpoint ($ES_PORT by default)
	-app           the name of the targeted application: rare, wheatis or data-discovery
	-env           the environment name of the targeted application (dev, beta, prod ...)
	-h or --help   print this help

EOF
	exit 1
}

check_command() {
  command -v $1 >/dev/null || {
    echo -e "${RED_BOLD}Program $1 is missing, cannot continue...${NC}"
    return 1
  }
  return 0
}

MISSING_COUNT=0
check_command jq || ((MISSING_COUNT += 1))

[ $MISSING_COUNT -ne 0 ] && {
  echo -e "${RED_BOLD}Please, install the $MISSING_COUNT missing program(s). Exiting.${NC}"
  exit $MISSING_COUNT
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
		-host) ES_HOST=$2;shift 2;;
		-port) ES_PORT=$2;shift 2;;
		-app) APP_NAME=$2;shift 2;;
		-env) ENV=$2;shift 2;;
		--) shift;break;;
		-*) echo "Unknown option: $1" && echo && help && echo;exit 1;;
		*) break;;
	esac
done

if [ -z "$ES_HOST" ] || [ -z "$ES_PORT" ] || [ -z "$APP_NAME" ] || [ -z "ENV" ]; then
    echo "ERROR: host, port, app and env parameters are mandatory!"
    echo && help
	exit 4
fi

TMP_FILE=$(mktemp)

CODE=0

check_acknowledgment() {
    jq '.acknowledged? == true' ${TMP_FILE} | grep 'true' >/dev/null || {
        ((CODE++)) ;
        echo -e "${RED_BOLD}ERROR: unexpected response from previous command:${NC}\n${ORANGE}$(cat ${TMP_FILE})${NC}";
    }
    > ${TMP_FILE}
}

# each curl command below sees its ouptut checked for acknowledgment from Elasticsearch, else display an error with colorized output

### SETTINGS & MAPPINGS TEMPLATE
MAPPING_PARTIAL_PATH="${APP_NAME}"
if [ "$APP_NAME" == "data-discovery" ]; then
    MAPPING_PARTIAL_PATH="wheatis" # needed to avoid duplicate mapping.json file between WheatIS and DataDiscovery
fi
echo -e "\nCreate settings/mappings template: ${APP_NAME}-${ENV}-settings-template"
curl -s -X PUT "${ES_HOST}:${ES_PORT}/_template/${APP_NAME}-${ENV}-settings-template" -H 'Content-Type: application/json' -d"
{
  \"index_patterns\": [\"${APP_NAME}-${ENV}-*\"],
  \"mappings\": {
    \"${APP_NAME}-${ENV}-resource\":
        $(cat ${BASEDIR}/../backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/${MAPPING_PARTIAL_PATH}/*.mapping.json)
    },
  \"settings\":
    $(cat ${BASEDIR}/../backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/settings.json )
}
"\
> ${TMP_FILE}
check_acknowledgment
echo -e "You can check the state of the settings template with:\ncurl -s -X GET '${ES_HOST}:${ES_PORT}/_template/${APP_NAME}-${ENV}-settings-template?pretty'"


### ILM POLICY TEMPLATE
echo -e "\nCreate policy template: ${APP_NAME}-${ENV}-policy-template"
curl -s -X PUT "${ES_HOST}:${ES_PORT}/_template/${APP_NAME}-${ENV}-policy-template" -H 'Content-Type: application/json' -d"
{
  \"index_patterns\": [\"${APP_NAME}-${ENV}-*\"],
  \"settings\":{
    \"index.lifecycle.name\": \"${APP_NAME}_policy\",
    \"index.lifecycle.rollover_alias\": \"${APP_NAME}-${ENV}-resource-alias\"
    }
}"\
> ${TMP_FILE}
check_acknowledgment
echo -e "You can check the state of the policy template with:\ncurl -s -X GET '${ES_HOST}:${ES_PORT}/_template/${APP_NAME}-${ENV}-policy-template?pretty'"


### INDEX LIFECYCLE MANAGEMENT POLICY
echo -e "\nCreate ${APP_NAME} policy"
curl -s -X PUT "${ES_HOST}:${ES_PORT}/_ilm/policy/${APP_NAME}_policy"\
 -H 'Content-Type: application/json' -d"
$(cat ${BASEDIR}/../backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/${APP_NAME}_policy.json )\
"\
> ${TMP_FILE}
check_acknowledgment
echo -e "You can check the state of the policy with:\ncurl -s -X GET '${ES_HOST}:${ES_PORT}/_ilm/policy/${APP_NAME}_policy?pretty'"


### INGEST PIPELINE
echo -e "\nCreate pipeline: datadiscovery-description-tokenizer-pipeline"
curl -s -X PUT "http://${ES_HOST}:${ES_PORT}/_ingest/pipeline/datadiscovery-description-tokenizer-pipeline" -H 'Content-Type: application/json' -d'
{
  "description": "Convert the description field into the suggestions field, to make it usable by an auto-completion query",
  "processors": [
    {
      "datadiscovery_description_tokenizer" : {
        "field" : "description",
        "target_field": "suggestions"
      }
    }
  ]
}'\
> ${TMP_FILE}
check_acknowledgment
echo -e "You can check the state of the pipeline with:\ncurl -s -X GET '${ES_HOST}:${ES_PORT}/_ingest/pipeline/datadiscovery-description-tokenizer-pipeline?pretty'"


## CREATE FIRST INDEX ALIASED BY THE ROLLOVER
echo -e "\nCreate index (aliased by ${APP_NAME}-${ENV}-resource-alias) to write first in: ${APP_NAME}-${ENV}-resource-index-000001"
curl -s -X PUT "${ES_HOST}:${ES_PORT}/${APP_NAME}-${ENV}-resource-index-000001?pretty"\
 -H 'Content-Type: application/json' -d"
{
    \"aliases\" : {
        \"${APP_NAME}-${ENV}-resource-alias\" : {
          \"is_write_index\": true
        }
    }
}
"\
> ${TMP_FILE}
check_acknowledgment
echo -e "You can check the state of the aliased index with:\ncurl -s -X GET '${ES_HOST}:${ES_PORT}/${APP_NAME}-${ENV}-resource-index-000001/_alias?pretty'"

rm -f $TMP_FILE

[ $CODE -gt 0 ] && { echo -e "${RED_BOLD}ERROR: a problem occurred during previous steps. Found ${CODE} errors.${NC}" ; exit ${CODE} ; }

echo -e "\n${GREEN}${BOLD}All seems OK.${NC}"
