#!/usr/bin/env jq -Mf

[.[] |
        [
            if ."@type"=="germplasm" and ."schema:identifier"
                then ."url"=($card + "germplasm?id=" + (."schema:identifier"|sub("=";"%3D")|sub("=";"%3D")))

            elif ."@type"=="germplasm" and ."@id"
               then ."url"=($card + "germplasm?pui=" + (."@id"|sub("=";"%3D")|sub("=";"%3D")))

            elif ."@type"=="study"
               then ."url"=($card + "studies/" + (."schema:identifier"|sub("=";"%3D")|sub("=";"%3D")))

            else .

            end
        ]
        | add
]