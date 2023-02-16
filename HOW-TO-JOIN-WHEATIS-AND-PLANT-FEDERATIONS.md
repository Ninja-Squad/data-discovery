
# How to join Plant data discovery Federations (FAIDARE, WheatIS)?

## Overview

The plant data discovery Federations (FAIDARE, wheatIS) provides search data portal that index the metadata from your data resources
and then link back to an access page in your system.
This indexation can be done using the following approaches:

- Datadiscovery files in a webfolder
- Breeding API (BrAPI) web service endpoint. Provides both datadiscovery and [summary cards](<https://doi.org/10.15454/V8WRHY>)
- Breeding API (BrAPI) files in a webfolder. Provides both datadiscovery and [summary cards](<https://doi.org/10.15454/V8WRHY>)

Each of those approaches are described below and all assume a minimum information set comprising an URL for link back plus description.

 The metadata format must follow the indications below and we invite you to [contact us](mailto:urgi-data@inrae.fr?subject=%5BWheatIS%2FAIDARE%5D) as soon as possible so that we can provide help and discuss the best way to go ahead.

## Breeding API (BrAPI)

This is the richer approach and will bring you all FAIDARE functionalities. The web services building will enable you to plug any [BrAPI](https://www.brapi.org) client on your database. The BrAPI file generation is simpler and easier to deploy.
Only Germplasms and study are indexed from a BreedingAPI endpoint, with their full description.
Those metadata will be used to create summary cards [such as](https://doi.org/10.15454/V8WRHY)
The datadiscovery metadata files, following the  [specifications](#datadiscovery-metadata-specifications) below are generated from those summaries.
Curently (FEB 2023), FAIDARE indexes BrAPI v1.1+ sources (V1.3 recomended).
### Web services

The breedingAPI full specifications are available on [www.brapi.org](https://brapi.org). The resources indexed are germplasms and study only. Information cards are created using the following calls :

- germplasm (mandatory)
- location (recommended)
- ontology (recommended)
- program
- study (mandatory)
- study/{studyDbId}/observationVariable  (recommended)
- study/{studyDbId}/germplasm (mandatory)
- study/{studyDbId}/observationUnit (can be resource intensive and therefore not implemented)
- trial (recommended)

> Note that since the tool makes a backlink to your information system, we need a URL to the study or the germplasm in the _`DocumentationURL`_ field of the BrAPI for researchers to get more detailed information about the indexed entry directly in your information system.

To ensure the quality of your BrAPI endpoint, you can use the validation tools provided by the BrAPI community, especially [Brava](http://webapps.ipk-gatersleben.de/brapivalidator/).

If you have any question or need help implementing BrAPI calls, you can [contact the BrAPI community](https://brapi.org/contact) or the [FAIDARE help desk](mailto:urgi-data@inrae.fr?subject=%5BWheatIS%2FAIDARE%5D).

### Files

If you don't want to implement a BrAPI endpoint,
you can simply generate the json for the summary cards and make them available in a web folder that you should reference
in [github](#referencing-of-a-brapi-endpoint). See some examples:

- [germplasm](https://forgemia.inra.fr/urgi-is/data-discovery/-/raw/master/data/brapi-file-repo-example/germplasm.json)
- [location](https://forgemia.inra.fr/urgi-is/data-discovery/-/raw/master/data/brapi-file-repo-example/location.json)
- [observationVariables](https://forgemia.inra.fr/urgi-is/data-discovery/-/raw/master/data/brapi-file-repo-example/observationVariables.json)
- [study](https://forgemia.inra.fr/urgi-is/data-discovery/-/raw/master/data/brapi-file-repo-example/study.json)
- [trial](https://forgemia.inra.fr/urgi-is/data-discovery/-/raw/master/data/brapi-file-repo-example/trial.json)

### Referencing of a BrAPI endpoint

For your endpoint to be visible on FAIDARE, you have to declare it in the sources of [Elixir's FAIDARE harvester](https://github.com/elixir-europe/plant-brapi-etl-data-lookup-gnpis).
To do this, you only have to create your own configuration file, according to the following template, and add it to the [`sources`](https://github.com/elixir-europe/plant-brapi-etl-data-lookup-gnpis/tree/master/sources) directory of the harvester:

```json
{
  "@context": {
    "schema": "http://schema.org/",
    "brapi": "https://brapi.org/"
  },
  "@type": "schema:DataCatalog",
  "@id": "[information system URL]",
  "schema:identifier": "[BrAPI endpoint name]",
  "schema:name": "[information system name]",
  "brapi:endpointUrl": "[BrAPI endpoint URL]"
}
```

Example: [URGI.json](https://github.com/elixir-europe/plant-brapi-etl-data-lookup-gnpis/blob/master/sources/URGI.json)

```json
{
  "@context": {
    "schema": "http://schema.org/",
    "brapi": "https://brapi.org/"
  },
  "@type": "schema:DataCatalog",
  "@id": "https://urgi.versailles.inra.fr/gnpis",
  "schema:identifier": "URGI",
  "schema:name": "URGI GnpIS",
  "brapi:endpointUrl": "https://urgi.versailles.inra.fr/faidare/brapi/v1/"
}
```

Example: [FZH.json](https://github.com/elixir-europe/plant-brapi-etl-data-lookup-gnpis/blob/master/sources/FZH.json)

```json
{
"@context": {
"schema": "http://schema.org/",
"brapi": "https://brapi.org/rdf/"
},
"@type": "schema:DataCatalog",
"@id": "http://apps.fz-juelich.de",
"schema:identifier": "FZH",
"schema:name": "FZH",
"brapi:static-file-repository-url": "http://apps.fz-juelich.de/faidare/",
"brapi:studyType": "Phenotyping"
}
```

If you have any question or need help referencing your endpoint, you can [contact us](mailto:urgi-contact@inra.fr?subject=%5BFAIDARE%5D).

### Data availability & update BrAPI

[Elixir's FAIDARE harvester](https://github.com/elixir-europe/plant-brapi-etl-data-lookup-gnpis) extract the metadata available from all declared sources (_i.e._ BrAPI endpoint) and index it into a centralised Elasticsearch cache.
The sources are reindexed regularly (once a month maximum) but if you want a reindexation following a major update on your side, please [inform us](mailto:urgi-contact@inra.fr?subject=%5BFAIDARE%5D).


## Datadiscovery files

This is the simplest approach, based on the description of each of your data resources with five fields.

Metadata must be provided in [TSV](#tsv-tabulation-separated-values) or [JSON](#json-javascript-object-notation) files.
Each document/data resource must be described with the following fields:

- short _[name](#name)_ identifying uniquely the entry, ie. `BTH_Le_Moulon_2000_SetA`
- _[url](#url)_ linking back to the entry in your own web application, ie. <https://urgi.versailles.inrae.fr/ephesis/ephesis/viewer.do#trialCard/trialId=56>
- _[description](#description)_, of the entry that contains all the relevant keywords allowing to find your entry. All the terms of this field are used by the search tool to allow users to find entries
- _[entryType](#entrytype)_ describing the type of the entry, that could be any of the terms listed in the dedicated section below
- _[species](#species)_ array of species (binomial) or genus related to the entry (zero, one or several, but it is highly recommended to provide at least one)
- _[node](#node)_, the name of your laboratory/institute, it should be the same for all the entities you manage
- _[databaseName](#databasename)_, the name of the database from which the entry has been extracted. It can differ from one entry to another if you handle several databases

All above fields are mandatory and can be completed with the following optionnal fields:

- _annotationId_ list of ontology IDs related to that entry, e.g. "WTO:0000071", "GO:0005524"
- _annotationName_, list of ontology Names correlated to the annotationId list, e.g. "crop yield (WTO:0000071)", "ATP binding (GO:0005524)"

### Datadiscovery metadata specifications

File detailed specifications for the metadata fields

#### name

[&#8593;](#top)

The value of the `name` field must be unique in your own dataset and should be clear enough to help scientists to identify at the first glance this entry among the other.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | Unique |

---

#### entryType

[&#8593;](#top)

The `entryType` field is not constrained on its value (it is not implemented as an enumeration), but it is highly recommended to use any of following values fitting the best with your data:

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

> **Note:** looking in the [data-discovery](https://urgi.versailles.inrae.fr/faidare) portal at the number of documents matching an entryType (see `Data type` filter on the left side) can help you to choose the data type having the closest meaning. If needed you still can chose a different data type than those already available.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | none, but preferably any of above items if applicable |

---

#### description

[&#8593;](#top)

The `description` field is the most important for the discoverability of the data since it is the one used to match terms from users.

It is up to you to provide the most relevant description allowing to match the entry, but keep in mind that the more precise the description is, better the ranking in the search tool would be.

The search tool is based on Elasticsearch. It therefore relies on Apache Lucene indexes in which the ranking is related to the term frequency/inverse document frequency (the used algorithm is currently BM25). That means that an entry having a description with a searched term appearing several times inside it but very rarely in all other documents will be likely returned with a high score. You can get more information on [similarity in Elasticsearch](https://www.elastic.co/blog/found-similarity-in-elasticsearch).

Also, be aware that we are adding all the other fields contents to the content of the description when preparing the data for indexation so that the name of the entry, its species etc... can be searched. It is therefore not necessary to add them explicitly in the description.

>>>
Note: be aware that all the data you provide in the file should be open access.
>>>

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | none |

---

#### url

[&#8593;](#top)

The `url` must be a valid URL so that this backlinks to your information system display information on the entry.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | none |

---

#### species

[&#8593;](#top)

`species` field is not mandatory, but it can be used to filter data. It can contain zero, one or more value according to the type of data.  
It is recommended to favor the binomial form without the Author abbreviation (ie `L.`), _e.g._ _Vitis vinifera_, _Quercus robur_, _Triticum aestivum_.

>>>
Note: for WheatIS federation specifically, the species name must match one of the values below in order to be available through the [WheatIS search tool](https://urgi.versailes.inrae.fr/wheatis), otherwise the entry will be filtered out. Note that if you have wheat and non wheat data, you don't have to provide them twice in dedicated files, the loading process will manage to generate the relevant indexes for the general plant search and the WheatIS search.

- Aegilops*
- Hordeum*
- Triticum*
- Wheat*
>>>

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Optional, but highly recommended | 0-* | none |

---

#### databaseName

[&#8593;](#top)

The `databaseName` from which the entry has been extracted. It can differ from one entry to another if you handle several databases.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | none |

---

#### node

[&#8593;](#top)

The `node` is the name of your laboratory/institute, it should be the same for all the entities you manage, ie. INRAE-URGI, EBI, IPK, USDA-ARS, CIMMYT...

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | Should be the same for all the data you provide |

---

### Formatting

It is recommended to publish your files in a web folder, in JSON format. If you are already using TSV it is alright, but this format is deprecated.
The file(s) can be either sent to us or published in a web folder from where it will be regularly updated (see [Data availability & update](#data-availability--update-datadiscovery) section).

#### TSV (Tabulation Separated Values)

[&#8593;](#top)

The order of the fields matters as in any TSV file. Take care to remove any tabulation or return line that can be present in the fields content in order to comply with the expected format.  
No double quotes are needed.  
The header is not needed, it is displayed here only for documentation purpose.

```csv
#name   entryType   node    databaseName    url species description
TRIAL_BTH_Le_Moulon_2000_SetA	Phenotyping study	INRAE-URGI	GnpIS	https://urgi.versailles.inrae.fr/ephesis/ephesis/viewer.do#trialCard/trialId=56	Triticum aestivum aestivum	BTH_Le_Moulon_2000_SetA is a trial lead at site: Le Moulon. Observation variables: WIPO:0000070 , WIPO:0000074 , WIPO:0000109 , WIPO:0000217 , WIPO:0000218 , WIPO:0000219 . This trial started on 1999-10-20 and finished on 2000-07-31, in the frame of project: 'INRA_Wheat_Breeding_Network'. Accession names: AO00001, AO99001, CF9804, CF9825, CF99002, CF99003, CF99005, CF99007, CF99009, CF99016, CF99027, CF99031, CHARGER, DI9714, DI9812, EM99001, EM99002, EM99003, EM99006, EM99012, EM99017, EM99021, EM99027, HA1066.146, HA1070.50, HA1541.134, ISENGRAIN, RE9819, RE99002, RE99003, RE99004, RE99006, RE99007, RE99009, RE99014, RE99016, RE99017, RE99018, Ressor, SOISSONS, TREMIE, VOLTIGE
10883/2969  Bibliography    CIMMYT  CIMMYT Dspace   http://hdl.handle.net/10883/2969    Septoria tritici blotch,Triticum aestivum l.,Wheat  Genetic analysis and mapping of seedling resistance to Septoria tritici blotch in 'Steele-ND'/'ND 735' bread wheat population 2013-01-01 Genetic analysis and mapping of seedling resistance to Septoria tritici blotch in 'Steele-ND'/'ND 735' bread wheat population Article
```

#### JSON (JavaScript Object Notation)

[&#8593;](#top)

The order of the fields does not matter. All entries should be aggregated into a single array per file.

```json
[
  {
    "entryType": "Phenotyping study",
    "node": "INRAE-URGI",
    "databaseName": "GnpIS",
    "description": "BTH_Le_Moulon_2000_SetA is a trial lead at site: Le Moulon. Observation variables: WIPO:0000070 , WIPO:0000074 , WIPO:0000109 , WIPO:0000217 , WIPO:0000218 , WIPO:0000219 . This trial started on 1999-10-20 and finished on 2000-07-31, in the frame of project: 'INRA_Wheat_Breeding_Network'. Accession names: AO00001, AO99001, CF9804, CF9825, CF99002, CF99003, CF99005, CF99007, CF99009, CF99016, CF99027, CF99031, CHARGER, DI9714, DI9812, EM99001, EM99002, EM99003, EM99006, EM99012, EM99017, EM99021, EM99027, HA1066.146, HA1070.50, HA1541.134, ISENGRAIN, RE9819, RE99002, RE99003, RE99004, RE99006, RE99007, RE99009, RE99014, RE99016, RE99017, RE99018, Ressor, SOISSONS, TREMIE, VOLTIGE",
    "url": "https://urgi.versailles.inrae.fr/ephesis/ephesis/viewer.do#trialCard/trialId=56",
    "species": ["Triticum aestivum aestivum"],
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

### Data availability & update DataDiscovery

[&#8593;](#top)

You can generate one or several files containing your public data as long as each of them complies with the format defined above.

Once they are generated, you will have to provide a way for us to fetch them on a regular basis. We can help you decide of the best way to do this exchange. Using a simple web (or FTP) server is a good solution since it allows us to check if a new version of your files has been produced.
