# How to join the RARe federation of searchable data?

The purpose of this tool is to facilitate the discoverability of public data on plant biology managed by
different laboratories accross the world.

Initiated within transPLANT (EC FP7, contract number 283496; http://www.transplantdb.eu/) and WheatIS
(www.wheatis.org) projects & collaborations, we are now able to index and make searchable data from
any species of any kind of data.

If you want your information system to be referenced, you have to provide CSV or JSON files with metadata
describing the data managed folowing the indications below and we invite you to [contact us](mailto:urgi-contact@inra.fr)
as soon as possible so that we can provide help and discuss the best way to go ahead.

Note that since the tool makes a backlink to your information system, we need a URL allowing researchers
to get more detailed information about the indexed entry directly in your information system.

# Specifications for each searchable entry/document:

TODO: fill brief version of specifications

## List of fields

TODO: fill complete list of fields

## Formatting

How to format the data to send to us? According to your experience, either in a TSV format or in a
JSON format. Below you find two kind of examples of what is expected with 2 entries:

### TSV (Tabulation Separated Values)

The order of the field matters as in any CSV/TSV file. Take care to remove any tabulation and return
line from each field in order to comply with the expected format.  
No double quotes is needed neither.  
The header is not needed, displayed here only for documentation purpose.

```csv
TODO  update with RARe CSV format
```

### JSON (JavaScript Object Notation)

The order of the fields does not matter. All entries should be aggregated into a single array per file.

```json
[
  {
    "TODO": "update with RARe JSON format"
  }
]
```
## Data availability & update

You can generate one or several files containing your data as long as each of them complies with
the format defined above.

Once they are generated, you will have to provide a way for us to fetch them on a regular basis: a
simple web (or FTP) server is a good solution since it allows us to check if a new version of your
files has been produced.
