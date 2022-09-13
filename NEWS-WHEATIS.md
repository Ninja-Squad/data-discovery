# News & perspectives

## Dissemination

Two webinars presented the WheatIS DataDiscovery tool:

1. On [2020 February the 25th](https://urgi.versailles.inra.fr/About-us/News/WheatIS-webinar) (with a [replay available](https://urgi.versailles.inra.fr/About-us/News/WheatIS-webinar-replay)) under the umbrella of the WheatInitiative.
2. On [2020 October the 7th](https://urgi.versailles.inra.fr/About-us/News/WheatIS-DataDiscovery-webinar-on-AgBioData-conference) (with a [replay available](https://youtu.be/pSST0jepoRg)) for the AgBioData community.

## Data updates

### 2022 
#### Ensembl Plants

Ensembl Genomes Plants has been updated up to release 54 (number to confirm).

### 2020-2021

#### GrainGenes

GrainGenes data has been updated with 3407 new QTL, and 58 genetic maps.

#### TheTriticeaeToolbox & Gramene (USDA)

T3 data as well as Gramene got updated with respective latest releases.



## New features

### 2022

### Add BrAPI data sources

Resources and databases that offers a [Breeding API](https://brapi.org/) end point are currently indexable in [FAIDARE](https://urgi.versailles.inrae.fr/faidare/), the Elixir plant data lookup service. The WheatIS data discovery and FAIDARE codebase have been unified to ease the management of data sources, to bring Breeding API indexation to WheatIS and to ease development and maintenance.

### 2020-2021

#### Ontologies

Searching resources annotated with [Gene Ontology](http://geneontology.org/) terms is now offered through a dedicated facet. So far, only resources from Wheat literature are annotated, but we plan to extend this soon.

#### Search by synonyms

Search by taxon now uses synonyms from 2 data sources: [NCBI](https://www.ncbi.nlm.nih.gov/taxonomy) and [GnpIS](https://urgi.versailles.inrae.fr/GnpMap/common/taxon/results.do?thematic=all). Any search term matching a known taxon name also searches its synonyms. Matching synonyms are highlighted in the results to inform the user of the process.

## Perspectives

### 2023

#### Monitor outgoing traffic towards partner databases

This metric will trace the impact of the WheatIS data portal, hence promoting its use.

#### Display date of last data update

Make the data loading process smoothier and display the date of the last data update in the web interface.

### Long term perspectives

### Extend ontology annotation

The [2020 ontology annotation feature](#ontologies) is expected to be extended to other kind of documents (any document containing a supported ontology term) as weel as using other ontologies (such as [Wheat Crop ontology](http://agroportal.lirmm.fr/ontologies/CO_321/), [Plant Ontology](http://agroportal.lirmm.fr/ontologies/PO) or [Wheat Trait and Phenotype Ontology](agroportal.lirmm.fr/ontologies/WHEATPHENOTYPE)).

### Allow search for exact phrases

Allow searching group of terms linked together, ie. "_fusarium head blight_". Currently, any of the 3 terms are searched independently, resulting in a lot of false positives.

### Review the storage of data

Currently the data is stored next to the code into Git LFS. We plan to review this approach to reduce the storage cost.

### Download results

Add a download feature allowing to get batch results in a tabulated and/or JSON format. Number of results to be clarified.

### Add `Bioschemas.org` sources

Web pages resources marked with [Bioschemas.org](https://bioschemas.org/) annotations will be indexed in the frame an [ELIXIR](https://elixir-europe.org/communities/plant-sciences) infrastructure [commissioned service](https://elixir-europe.org/activities/exploiting-bioschemas-markup-support-elixir-communities).
