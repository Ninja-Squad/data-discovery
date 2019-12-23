#!/usr/bin/env jq -Mf

# Transforms a JSON array of documents in Elasticsearch compliant bulk file
# using value of 'ID_FIELD' variable as the Elasticsearch documents identifier
# The input data must be of type 'JSON array'.
# If one of the documents misses the key given in the variable $ENV.ID_FIELD,
# then it is dropped with a WARNING message in stderr
# Return codes:
#   - 0 if process succeeded
#   - 1 if the ID_FIELD variable is not assigned
#   - 2 if the input is not a JSON array

def to_bulk(identifier):
    .[] |
        if (( .databaseName? + "__" + .entryType? + "__" + (.species?|tostring) + "__" + .name? + "__" + .identifier? | tostring) != "________") then
            . |= { "index": { "_id": ( .databaseName? + "__" + .entryType? + "__" +
                if ((.species | type) == "array"
                    and (.species|length) <= 1) then
                    .species?[0]|tostring
                else
                    .species|tostring
                end
                + "__" + .name? +  "__" + .identifier? | tostring)}}, .                                      # add a bulk header with custom _id to the object
        else
            . |= { "index": { }}, .                                      # add a default bulk header to the object
        end
;

if ($ENV.ID_FIELD != null and $ENV.ID_FIELD != "") then
    if (type != "array") then
        "[ERROR]: the input is expected to be an array in order to produce JSON lines bulk file.\n" | halt_error(2)
    else
        to_bulk($ENV.ID_FIELD)
    end
else
    "[ERROR]: you need to specify the document's identifier field (in a 'ID_FIELD' variable) for setting in the bulk headers.\n" | halt_error(1)
end
