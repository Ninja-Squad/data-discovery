# How to join the federation

The purpose of this tool is to facilitate the discoverability of public biologicial data managed by 
different laboratories accross the world.

Initiated within transPLANT and WheatIS project & collaborations, we are now able to index and make 
searchable data from any species of any kind of data.

If you want to be referenced you'll need to provide CSV or JSON files with some metadata describing 
the biological entities you manage. Once you have read below indications, we invite you to contact us 
as soon as possible so that we can provide help and discuss the best way to do it.

Since the tool makes a backlink to your information system, we need a URL allowing researchers to get 
more detailed information about the indexed entity.

In order to integrate your data, here is what is need for each searchable entry/document:

- a short _[name](#name)_ identifying uniquely the entry, ie. _IGR_2010_1_
- an _[url](#url)_ linking back to the entry in your own web application, ie. 
https://urgi.versailles.inra.fr/ephesis/ephesis/viewer.do#trialCard/trialId=3
- a _[description](#description)_, describing the entry and containing all the relevant keywords 
allowing to find your entry. This field is the one in which user entered terms are searched for, in 
the search tool
- an _[entryType](#entrytype)_ describing the type of the entry, that could be any of the terms listed 
in the dedicated section
- a _[species](#species)_ field, containing the species related to the entry (zero, one or several, 
but it is highly recommended to provide at least one)
- a _[node](#node)_, the name of your laboratory/institute, it should be the same for all the entities 
you manage
- a _[database](#database)_, the name of the database from which the entity has been extracted. It 
can differ from one entity to another if you handle several databases

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
- Experiment
- QTL
- Phenotype
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

Since we use Elasticsearch under the hood, which is based on Apache Lucene, the ranking will be 
related to the term frequency/inverse document frequency (the used algorithm is currently BM25). That 
means an entry having a description with a searched term appearing several times inside it but very 
rarely in all other documents, will be likely returned with a higher score if this term is searched.
You can get more info on [similarity](https://www.elastic.co/blog/found-similarity-in-elasticsearch) 
in Elasticsearch.

Also, be aware that we are copying all fields in the description when integrating the data so that 
the name, the species and so on will be searched automatically, so it is not mandatory to add them 
explicitly in the description.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | none |

### url

The `url` must be dereferencable so that this backlink to your information system display information 
on the document.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | none |

### species

`species` field is not mandatory, but it can be used to filter data. It can contain zero, one or more 
value according to the type of data.

>>>
Note: for WheatIS federation specifically, it must match any of these values in order to be 
available through the [WheatIS search tool](https://urgi.versailes.inra.fr/wheatis), otherwise, the
entry will be filtered out (anyway, if you have some non wheat related data, you don't have to provide
twice in dedicated files, the loading process will manage all of them in the different flavours):

- Aegilops*
- Hordeum*
- Triticum*
- Wheat*
>>>

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Optional, but highly recommended | 0-* | none |

### database

The name of the `database` from which the entity has been extracted. It 
can differ from one entity to another if you handle several databases.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | none |

### node

The `node` is the name of you laboratory/institute, it should be the same for all the entities 
you manage.

| Status | Cardinality | Constraints |
| :---: | :---: | :---: |
| Mandatory | 1 | Should be the same for all the data you provide |

## Formatting

How to format the data to send to us? According to your experience, either in a TSV format or in a 
JSON format. Below you find two kind of examples of what is expected with 2 entries: 

### TSV (Tabulation Separated Values)

The order of the field matters as in any CSV/TSV file. Take care to remove any tabulation and return 
line from each field in order to comply with the expected format.  
No double quotes is needed neither.  
The header is not needed, displayed here only for documentation purpose.

```csv
#name	entryType	node	databaseName	url	species	description
TRIAL_IGR_2010_1	Experiment	URGI	GnpIS	https://urgi.versailles.inra.fr/ephesis/ephesis/viewer.do#trialCard/trialId=3	Hordeum vulgare	IGR_2010_1 is a trial lead at site: IPGPAS, which comment is: 'IPGPAS public'. Observation variables: GNPISO_3:0000001 , GNPISO_3:0000002 , GNPISO_3:0000003 , GNPISO_3:0000004 , GNPISO_3:0000005 , GNPISO_3:0000006 , GNPISO_3:0000007 , GNPISO_3:0000008 , GNPISO_3:0000009 , GNPISO_3:0000010 , GNPISO_3:0000011 , GNPISO_7:0000001 , GNPISO_7:0000002 . Accession names: CamB1, Georgia, Harmal, Lubuski, Maresi, MDingo, Morex, Sebastian, Stratus from taxon(s) Hordeum vulgare Hordeum vulgare Phenotyping
10883/2969	Bibliography	CIMMYT	CIMMYT Dspace	http://hdl.handle.net/10883/2969	Septoria tritici blotch,Triticum aestivum l.,Wheat	Genetic analysis and mapping of seedling resistance to Septoria tritici blotch in 'Steele-ND'/'ND 735' bread wheat population 2013-01-01 Genetic analysis and mapping of seedling resistance to Septoria tritici blotch in 'Steele-ND'/'ND 735' bread wheat population Article
```

### JSON (JavaScript Object Notation)

The order of the fields does not matter. All entries should be aggregated into a single array per file.

```json
[
  {
    "entryType": "Experiment",
    "node": "URGI",
    "databaseName": "GnpIS",
    "description": "IGR_2010_1 is a trial lead at site: IPGPAS, which comment is: 'IPGPAS public'. Observation variables: GNPISO_3:0000001 , GNPISO_3:0000002 , GNPISO_3:0000003 , GNPISO_3:0000004 , GNPISO_3:0000005 , GNPISO_3:0000006 , GNPISO_3:0000007 , GNPISO_3:0000008 , GNPISO_3:0000009 , GNPISO_3:0000010 , GNPISO_3:0000011 , GNPISO_7:0000001 , GNPISO_7:0000002 . Accession names: CamB1, Georgia, Harmal, Lubuski, Maresi, MDingo, Morex, Sebastian, Stratus from taxon(s) Hordeum vulgare Hordeum vulgare Phenotyping",
    "url": "https://urgi.versailles.inra.fr/ephesis/ephesis/viewer.do#trialCard/trialId=3",
    "species": [
      "Hordeum vulgare"
    ],
    "name": "TRIAL_IGR_2010_1"
  },
  {
    "entryType": "Bibliography",
    "node": "CIMMYT",
    "databaseName": "CIMMYT Dspace",
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

You can generate one or several files containing your data as long as each of them complies with 
the format defined above.

Once they are generated, you'll have to provide a way for us to fetch them on a regular basis: a 
simple web (or FTP) server is a good solution since it allows us to check if a new version of your 
files has been produced.
