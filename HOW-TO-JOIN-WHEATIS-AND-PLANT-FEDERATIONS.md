# How to join the wheatIS and/or the Plant federations of searchable data?

The purpose of this web portal is to facilitate the discoverability of public data on plant biology
managed by different laboratories accross the world.

Initiated within transPLANT (EC FP7, contract number `283496`; http://www.transplantdb.eu/), WheatIS
(www.wheatis.org) then Elixir-fr/IFB (ANR, contract number `11-INBS-0013`) projects & collaborations, we are
now able to index and make findable data from any species of any kind of data.

If you want your information system to be referenced, you have to provide CSV/TSV or JSON files with metadata only.
The metadata format must folow the indications below and we invite you to [contact us](mailto:urgi-contact@inra.fr?subject=%5BWheatIS%2FData%20Discovery%5D)
as soon as possible so that we can provide help and discuss the best way to go ahead.

Note that since the tool makes a backlink to your information system, we need a URL allowing researchers
to get more detailed information about the indexed entry directly in your information system.

# Specifications for each searchable entry/document:

- a short _[name](#name)_ identifying uniquely the entry, ie. `BTH_Le_Moulon_2000_SetA`
- an _[url](#url)_ linking back to the entry in your own web application, ie.
https://urgi.versailles.inra.fr/ephesis/ephesis/viewer.do#trialCard/trialId=56
- a _[description](#description)_, describing the entry and containing all the relevant keywords
allowing to find your entry. This field is the one in which user entered terms are searched for, in
the search tool
- an _[entryType](#entrytype)_ describing the type of the entry, that could be any of the terms listed
in the dedicated section
- a _[species](#species)_ field, containing the species related to the entry (zero, one or several,
but it is highly recommended to provide at least one)
- a _[node](#node)_, the name of your laboratory/institute, it should be the same for all the entities
you manage
- a _[database](#database)_, the name of the database from which the entry has been extracted. It
can differ from one entry to another if you handle several databases

## List of fields

### name

The value of `name` field must be unique in your own dataset and should be clear enough to help
scientists to identify at the first glance this entry among the other.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | Unique |

### entryType

The `entryType` field is not constrained on its value (it is not implemented as an
enumeration), but it is highly recommended to use any of following values fitting the best with
your data (some types are more generic and can include more specific ones):

- Genome annotation
- Gene annotation
- Physical map feature
- Gene
- Genetic marker
- Physical marker
- Marker
- Germplasm
- Repeat reference
- Bibliography
- Phenotyping study
- Genotyping Experiment
- Sequencing Experiment
- Transcriptomic Experiment
- QTL
- Pathway
- Genetic map
- GWAS analysis
- Physical map
- File
- Study

> **Note:** looking in the [data-discovery](https://urgi.versailles.inra.fr/data-discovery) portal at
the number of documents matching an entryType (see `Data type` filter on the left side) can help you
to choose the data type having the closest meaning. If you choose a different data type than those
already provided, be aware that this filter might not display yours because of the top hits ranking
made on the filter.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | none, but preferably any of above items if applicable |

### description

The `description` field is the most important for the discoverability of the data since it's the one
used to match terms from users.

It is up to you to provide the most relevant description allowing to match the entry, but keep in
mind that the more precise the description is, better the ranking in the search tool would be.

Since the search tool is based on Elasticsearch, it relies on Apache Lucene indexes and the ranking
will be related to the term frequency/inverse document frequency (the used algorithm is currently
BM25). That means an entry having a description with a searched term appearing several times inside
it but very rarely in all other documents, will be likely returned with a high score. You can get
more info on [similarity](https://www.elastic.co/blog/found-similarity-in-elasticsearch) in
Elasticsearch.

Also, be aware that we are adding all fields contents to the content of the description when integrating
the data before indexation so that the name of the entry, its species etc... can be searched. It is
therefore not necessary to add them explicitly in the description.

>>>
Note: be aware that all the data you provide in the file should be open access.
>>>

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | none |

### url

The `url` must be a valid URL so that this backlinks to your information system display information
on the entry.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | none |

### species

`species` field is not mandatory, but it can be used to filter data. It can contain zero, one or more
value according to the type of data.  
It is recommended to favor the binomial form without the Author abbreviatoin (ie `L.`), eg Vitis
vinifera, Quercus Robur, Triticum aestivum

>>>
Note: for WheatIS federation specifically, the species name must match one of the values below in order
to be available through the [WheatIS search tool](https://urgi.versailes.inra.fr/wheatis), otherwise the
entry will be filtered out. Note that if you have wheat and non wheat data, you don't have to provide
them twice in dedicated files, the loading process will manage to generate the relevant indexes for the
general plant search and the WheatIS search.

- Aegilops*
- Hordeum*
- Triticum*
- Wheat*
>>>

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Optional, but highly recommended | 0-* | none |

### database

The name of the `database` from which the entry has been extracted. It
can differ from one entry to another if you handle several databases.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | none |

### node

The `node` is the name of you laboratory/institute, it should be the same for all the entities
you manage, ie. INRA-URGI, EBI, IPK, USDA-ARS, CIMMYT...

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | Should be the same for all the data you provide |

## Formatting

How to format the data to send to us?  
You can use either TSV or JSON format. The file(s) can be either sent to us or published in a web folder
from where it will be regularly updated (see [Data availability & update](#data-availability-update)
section). Below you find two kind of examples of what is expected with 2 entries:

### TSV (Tabulation Separated Values)

The order of the field matters as in any CSV/TSV file. Take care to remove any tabulation and return
line from each field in order to comply with the expected format.  
No double quotes is needed neither.  
The header is not needed, displayed here only for documentation purpose.

```csv
#name   entryType   node    databaseName    url species description
TRIAL_BTH_Le_Moulon_2000_SetA	Phenotyping study	INRA-URGI	GnpIS	https://urgi.versailles.inra.fr/ephesis/ephesis/viewer.do#trialCard/trialId=56	Triticum aestivum aestivum	BTH_Le_Moulon_2000_SetA is a trial lead at site: Le Moulon. Observation variables: WIPO:0000070 , WIPO:0000074 , WIPO:0000109 , WIPO:0000217 , WIPO:0000218 , WIPO:0000219 . This trial started on 1999-10-20 and finished on 2000-07-31, in the frame of project: 'INRA_Wheat_Breeding_Network'. Accession names: AO00001, AO99001, CF9804, CF9825, CF99002, CF99003, CF99005, CF99007, CF99009, CF99016, CF99027, CF99031, CHARGER, DI9714, DI9812, EM99001, EM99002, EM99003, EM99006, EM99012, EM99017, EM99021, EM99027, HA1066.146, HA1070.50, HA1541.134, ISENGRAIN, RE9819, RE99002, RE99003, RE99004, RE99006, RE99007, RE99009, RE99014, RE99016, RE99017, RE99018, Ressor, SOISSONS, TREMIE, VOLTIGE
10883/2969  Bibliography    CIMMYT  CIMMYT Dspace   http://hdl.handle.net/10883/2969    Septoria tritici blotch,Triticum aestivum l.,Wheat  Genetic analysis and mapping of seedling resistance to Septoria tritici blotch in 'Steele-ND'/'ND 735' bread wheat population 2013-01-01 Genetic analysis and mapping of seedling resistance to Septoria tritici blotch in 'Steele-ND'/'ND 735' bread wheat population Article
```

### JSON (JavaScript Object Notation)

The order of the fields does not matter. All entries should be aggregated into a single array per file.

```json
[
  {
    "entryType": "Phenotyping study",
    "node": "INRA-URGI",
    "databaseName": "GnpIS",
    "description": "BTH_Le_Moulon_2000_SetA is a trial lead at site: Le Moulon. Observation variables: WIPO:0000070 , WIPO:0000074 , WIPO:0000109 , WIPO:0000217 , WIPO:0000218 , WIPO:0000219 . This trial started on 1999-10-20 and finished on 2000-07-31, in the frame of project: 'INRA_Wheat_Breeding_Network'. Accession names: AO00001, AO99001, CF9804, CF9825, CF99002, CF99003, CF99005, CF99007, CF99009, CF99016, CF99027, CF99031, CHARGER, DI9714, DI9812, EM99001, EM99002, EM99003, EM99006, EM99012, EM99017, EM99021, EM99027, HA1066.146, HA1070.50, HA1541.134, ISENGRAIN, RE9819, RE99002, RE99003, RE99004, RE99006, RE99007, RE99009, RE99014, RE99016, RE99017, RE99018, Ressor, SOISSONS, TREMIE, VOLTIGE",
    "url": "https://urgi.versailles.inra.fr/ephesis/ephesis/viewer.do#trialCard/trialId=56",
    "species": "Triticum aestivum aestivum",
    "name": "TRIAL_BTH_Le_Moulon_2000_SetA"
  },
  {
    "entryType": "Bibliography",
    "node": "CIMMYT",
    "databaseName": "CIMMYT Publications",
    "description": "Genetic analysis and mapping of seedling resistance to Septoria tritici blotch in 'Steele-ND'/'ND 735' bread wheat population 2013-01-01 Genetic analysis and mapping of seedling resistance to Septoria tritici blotch in 'Steele-ND'/'ND 735' bread wheat population Article",
    "url": "http://hdl.handle.net/10883/2969",
    "species": [
      "Septoria tritici blotch",
      "Triticum aestivum l.",
      "Wheat"
    ],
    "name": "10883/2969"
  }
]
```

## Data availability & update

You can generate one or several files containing your public data as long as each of them complies
with the format defined above.

Once they are generated, you will have to provide a way for us to fetch them on a regular basis: a
simple web (or FTP) server is a good solution since it allows us to check if a new version of your
files has been produced.
