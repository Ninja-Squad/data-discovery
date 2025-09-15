# How to join RARe federation

If you want your information system to be referenced, you have to provide [TSV](#tsv-tabulation-separated-values) or [JSON](#json-javascript-object-notation) files with metadata only.
The metadata format must follow the indications below (see [Data Specifications](#data-specifications)).
We invite you to [contact us](mailto:urgi-data@inrae.fr?subject=%5BRARe%20portal%5D) as soon as possible so that we can provide help and discuss the best way to go ahead.

Note that since the tool makes a backlink to your information system, a URL allowing researchers to get more detailed information about the indexed entry directly in your information system is needed.

## Data Specifications

Be aware that all data you provide in the file should be open access.

An entry/document must be created for each searchable data.
Each entry/document is described with the following fields:

### pillarName

Name of your pillar.
It should be the same for all the entities you manage.

The value is constrained. You must use one of the following values:

- Pilier Animal
- Pilier Environnement
- Pilier Forêt
- Pilier Micro-organisme
- Pilier Plante

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | One of the provided list |

### databaseSource

Name of the database from which the entry has been extracted.
It can differ from one entry to another if you handle several information systems.
If your BRC's database is missing, please ask us to add it:

- CRB-Anim
- CEES
- CoArCol
- Colisa
- EP-Coll
- GenoSol
- IBG
- SmArtCol
- CIRM-BIA
- CIRM-BP
- CIRM-CF
- CIRM-CFBP
- CIRM-Levures
- FAN
- SAMBO
- Forest Tree GnpIS
- CNRGV
- Florilege
- Siregal@GnpIS

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | None |

### portalURL

URL to access to the website of the information system from which the entry was extracted (`databaseSource`).
It must be a valid URL that backlinks to your own information system.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | None |

### identifier

Identifier of the entity.
It is only used to uniquely identify the entry among all data; it is not displayed on the search tool. You should make sure that it is unique in your data and we modify it to make sure it is unique among all the data sources references under the web portal.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | Unique among all pillars |

### name

Name of the entry.
The value must be unique in your own dataset and should be clear enough to help scientists to identify at the first glance this entry among other.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | Unique within your pillar |

### description

Description of the entry.
It must contain all the relevant keywords allowing to find your entry and to understand what the entry is.

It is the most important field for the discoverability of the data since it is the one used to match terms searched by users.
It is up to you to provide the most relevant description allowing to match the entry, but keep in mind that the more precise the description is, better the ranking in the search tool would be.

The search tool is based on Elasticsearch. It therefore relies on Apache Lucene indexes in which the ranking is related to the term frequency/inverse document frequency (the used algorithm is currently BM25).
That means that an entry having a description with a searched term appearing several times inside it but very rarely in all other documents will be likely returned with a high score.
You can get more information on [similarity in Elasticsearch](https://www.elastic.co/blog/found-similarity-in-elasticsearch).

Also, be aware that the content of all other fields (the name of the entry, its species etc...) can also be searched.
It is therefore not necessary to add them explicitly in the description.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | None |

### dataURL

URL to access to the entity information on the website of the database from which the entry was extracted (`databaseSource`).
It must be a valid URL that backlinks to the entry in your own information system.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | None |

### domain

Taxonomic domain of the entity.

The value is constrained. You must use one of the following values, the one fitting the best your data:

- Animalia
- Archaea
- Bacteria
- Chromista
- Fungi
- Plantae
- Protozoa
- Environment sampling
- Consortium

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | One of the provided list |

### taxon

Genus or species (in the binomial form) of the entity, without the author abbreviation (_e.g._ _Populus_, _Vitis vinifera_).

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | None |

### materialType

Type of material available for this entry.

The value is constrained. You must use one of the following values, the one fitting the best your data:

- Biological liquid
- Budstick/Cutting
- Culture cell/strain
- DNA
- Embryo
- Environmental sample
- Genome library
- Pollen
- Seed
- Specimen
- Tissue sample
- Transcriptome library

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Optional | 1 | One of the provided list |

### biotopeType

Biotope or habitat where the entity mainly lives.

The value is constrained. You must use one of the following values, the one fitting the best your data:

- Animal
- Beverage
- Environment
- Fermented food
- Food
- Fruit
- Fungi
- Hospital
- Human
- Industry
- Laboratory
- Microcosm
- Plant
- Soil
- Water
- Wood

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Optional | 1 | One of the provided list |

### countryOfOrigin

Country from which the entity originally comes from.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Optional | 1 | None |

### originLatitude

Latitude of the country from which the entity originally comes from.
It must be part of a decimal degrees format (_e.g._ `3.9988889` for `3.9988889,-53` coordinates).

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Optional | 1 | -90 < Lat. < 90 |

### originLongitude

Longitude of the country from which the entity originally comes from.
It must be part of a decimal degrees format (_e.g._ `-53` for `3.9988889,-53` coordinates).

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Optional | 1 | -180 < Long. < 180 |

### countryOfCollect

Country from which the entity was collected.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Optional | 1 | None |

### collectLatitude

Latitude of the country from which the entity was collected.
It must be part of a decimal degrees format (_e.g._ `3.9988889` for `3.9988889,-53` coordinates).

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Optional | 1 | -90 < Lat. < 90 |

### collectLongitude

Longitude of the country from which the entity was collected.
It must be part of a decimal degrees format (_e.g._ `-53` for `3.9988889,-53` coordinates).

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Optional | 1 | -180 < Long. < 180 |

### accessionHolder

The name of the BRC in charge of the resource distribution. In some cases, it can be the same as the `databaseSource`. In other cases, it can differ, epecially when the holders of a same BRC are distributed in geographically distinct sites.
This optional field is used to order genetic resources, it allows us to know the holder of the accession to contact.

Since the value is used to link the accession to its holder, it is constrained. You should use one of the following values.
If your BRC is missing, please ask us to add it:

- CEES
- CoArCol
- Colisa
- EP-Coll
- GenoSol
- IBG
- Forest BRC - Avignon
- Forest BRC - Pierroton
- Forest BRC - Orléans

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Optional | 1 | One of the provided list |

[&#8593;](#top)

## Data formatting

How to format the data to send to us?

You can use either a [TSV](#tsv-tabulation-separated-values) or [JSON](#json-javascript-object-notation) format.
The file(s) can be either sent to us or published in a web folder from where it will be regularly updated (see [Data availability & update](#data-availability-update) section).

### TSV (Tabulation Separated Values)

The order of the fields matters as in any TSV file.
Take care to remove any tabulation or return line that can be present in the fields content in order to comply with the expected format.
No double quotes are needed.

<!-- markdownlint-disable MD009 MD010 -->
```csv
#pillarName	databaseSource	portalURL	identifier	name	description	dataURL	domain	taxon	materialType	biotopeType	countryOfOrigin	originLatitude	originLongitude	countryOfCollect	collectLatitude	collectLongitude	accessionHolder
Pilier Forêt	Forest Tree GnpIS	https://urgi.versailles.inra.fr/faidare/?germplasmLists=Forest%20BRC	https://doi.org/10.15454/0FZNAO	661300375	661300375 is a Populus x generosa accession (number: 661300375, https://doi.org/10.15454/0FZNAO) maintained by the Forest BRC (managed by INRA) and held by INRA-ONF. It is a clone/clone of biological Statut interspecific cross/croisement interspécifique. This accession is also known as: 0054B165. This accession is part of collection(s): breeding_gispeuplier, mapping_pedigree_0504B. This accession has phenotyping data: bacterial canker resistance test of mapping pedigree 0504B, clonal test of mapping pedigree 0504B in nursery. This accession has genotyping data: Popyomics_Orleans	https://urgi.versailles.inrae.fr/faidare/germplasm?pui=https://doi.org/10.15454/0FZNAO	Plantae	Populus x generosa	Specimen							Forest BRC - Orléans
Pilier Micro-organisme	CIRM-CF	http://139.124.42.231/~davnav/BRFM/search_strain2.php	BRFM 902	BRFM 902	Pycnoporus sanguineus BRFM 902 GUY110 burnt wood, Macouria Polyporaceae Polyporales Basidiomycota	http://139.124.42.231/~davnav/BRFM/fiche.php?BRFM_Number=902	Fungi	Pycnoporus sanguineus		Wood	French Guiana	3.9988889	-53	French Guiana	3.9988889	-53	
```
<!-- markdownlint-enable MD009 MD010 -->

### JSON (JavaScript Object Notation)

The order of the fields does not matter. All entries should be aggregated into a single array per file.

```json
[
  {
    "pillarName": "Pilier Forêt",
    "databaseSource": "Forest Tree GnpIS",
    "portalURL": "https://urgi.versailles.inrae.fr/faidare/#form/germplasmLists=Forest+BRC",
    "identifier": "https://doi.org/10.15454/0FZNAO",
    "name": 661300375,
    "description": "661300375 is a Populus x generosa accession (number: 661300375, https://doi.org/10.15454/0FZNAO) maintained by the Forest BRC (managed by INRA) and held by INRA-ONF. It is a clone/clone of biological status interspecific cross/croisement interspécifique. This accession is also known as: 0054B165. Its taxon is also known as: P. deltoides x P. trichocarpa, Populus deltoides x Populus trichocarpa, Populus trichocarpa x Populus deltoides, Populus x generosa A. Henry, Populus x interamericana, P. trichocarpa x P. deltoides, P. xgenerosa Henry, P xinteramericana. This accession is part of collection(s): breeding_gispeuplier, mapping_pedigree_0504B. This accession has phenotyping data: bacterial canker resistance test of mapping pedigree 0504B - QTL mapping of bacterial canker resistance, clonal test of mapping pedigree 0504B in nursery - QTL mapping of a list of phenotypic traits. This accession has genotyping data: Popyomics_Orleans",
    "dataURL": "https://urgi.versailles.inrae.fr/faidare/#accessionCard/pui=https://doi.org/10.15454/0FZNAO",
    "domain": "Plantae",
    "taxon": "Populus x generosa",
    "family": "Salicaceae",
    "genus": "Populus",
    "species": "Populus x generosa",
    "materialType": "Specimen",
    "biotopeType": null,
    "countryOfOrigin": null,
    "latitudeOfOrigin": null,
    "longitudeOfOrigin": null,
    "countryOfCollect": null,
    "latitudeOfCollect": null,
    "longitudeOfCollect": null,
    "accessionHolder": "Forest BRC - Orléans"
  },
  {
    "pillarName": "Pilier Micro-organisme",
    "databaseSource": "CIRM-CF",
    "portalURL": "http://139.124.42.231/~davnav/BRFM/search_strain2.php",
    "identifier": "BRFM 902",
    "name": "BRFM 902",
    "description": "Pycnoporus sanguineus BRFM 902 GUY110 burnt wood, Macouria Polyporaceae Polyporales Basidiomycota",
    "dataURL": "http://139.124.42.231/~davnav/BRFM/fiche.php?BRFM_Number=902",
    "domain": "Fungi",
    "taxon": "Pycnoporus sanguineus",
    "family": null,
    "genus": null,
    "species": null,
    "materialType": null,
    "biotopeType": "Wood",
    "countryOfOrigin": "French Guiana",
    "latitudeOfOrigin": "3.9988889",
    "longitudeOfOrigin": "-53",
    "countryOfCollect": "French Guiana",
    "latitudeOfCollect": "3.9988889",
    "longitudeOfCollect": "-53",
    "accessionHolder": null
  }
]
```

[&#8593;](#top)

## Data availability & update

You can generate one or several files containing your public data as long as each of them complies with the format defined above.

Once they are generated, you will have to provide a way for us to fetch them on a regular basis. We can help you decide of the best way to do this exchange. Using a simple web (or FTP) server is a good solution since it allows us to check if a new version of your files has been produced.

[&#8593;](#top)
