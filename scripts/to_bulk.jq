#!/usr/bin/env jq -Mf

# Transforms a JSON array of documents in Elasticsearch compliant bulk file
# using value of 'ID_FIELD' variable if provided, or using concatenation of
# several fields, as the Elasticsearch documents identifier
# The input data must be of type 'JSON array'.
# Return codes:
#   - 0 if process succeeded
#   - 2 if the input is not a JSON array

def to_string:
    if ((. | type) == "array") then
        .|join("|")|tostring
    else
        .|tostring
    end
    | if(. == "null" or . == null) then
        ""
    else
        .
    end
;

def to_bulk($identifier):
    .[] |
        if has($identifier) then
            . |= { "create": { "_id": ( .[$identifier] | to_string)}}, . # add a bulk header with value of field 'identifier' to the object
        elif ((.name?|to_string) + "#" + (.identifier?|to_string) + "#" + (.species?|to_string) + "#" + .entryType? + "#" +  .databaseName? != "####") then
            . |= { "create": { "_id": ((.name?|to_string) + "#" + (.identifier?|to_string) + "#" + (.species?|to_string) + "#" + .entryType? + "#" +  .databaseName?) }}, . # add a bulk header with custom _id to the object
        else
            . |= { "create": { }}, . # add a default bulk header to the object
        end
;

if (type != "array") then
    "[ERROR]: the input is expected to be an array in order to produce JSON lines bulk file.\n" | halt_error(2)
else
    to_bulk($ENV.ID_FIELD) |
    if ($ENV.APP_NAME != "rare") then
        del (.identifier) # remove identifier field for some documents having it
    else
        .
    end
end
