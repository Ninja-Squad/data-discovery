# News & perspectives

## News 2020

### Dissemination 2020

Two webinars presented the WheatIS DataDiscovery tool:

1. On [February the 25th](https://urgi.versailles.inra.fr/About-us/News/WheatIS-webinar) (with a [replay available](https://urgi.versailles.inra.fr/About-us/News/WheatIS-webinar-replay)) under the umbrella of the WheatInitiative.
2. On [October the 7th](https://urgi.versailles.inra.fr/About-us/News/WheatIS-DataDiscovery-webinar-on-AgBioData-conference) (with a [replay available](https://youtu.be/pSST0jepoRg)) for the AgBioData community.

### Data updates 2020

#### GrainGenes

GrainGenes data has been updated with 3407 new QTL, and 58 genetic maps

#### TheTriticeaeToolbox & Gramene (USDA)

T3 data as well as Gramene got updated with respective latest releases

#### Ensembl Plants

Ensembl Genomes Plants has been updated up to releases 45 and 46, last new release is in the current roadmap.

### New features 2020

#### Ontologies

Searching resources annotated with [Gene Ontology](http://geneontology.org/) terms is now offered through a dedicated facet. So far, only resources from Wheat literature are annotated, but we plan to extend this soon.

#### Search by synonyms

Search by taxon now uses synonyms from 2 data sources: [NCBI](https://www.ncbi.nlm.nih.gov/taxonomy) and [GnpIS](https://urgi.versailles.inrae.fr/GnpMap/common/taxon/results.do?thematic=all). Any search term matching a known taxon name also searches its synonyms. Matching synonyms are highlighted in the results to inform the user of the process.

## Perspectives 2021

### Add `Bioschemas.org` sources

Web pages resources marked with [Bioschemas.org](https://bioschemas.org/) annotations will be indexed in the frame an [ELIXIR](https://elixir-europe.org/communities/plant-sciences) infrastructure [commissioned service](https://elixir-europe.org/activities/exploiting-bioschemas-markup-support-elixir-communities).

### Add BrAPI data sources

Resources and databases that offers a [Breeding API](https://brapi.org/) end point are currently indexable in [FAIDARE](https://urgi.versailles.inrae.fr/faidare/), the Elixir plant data lookup service. The WheatIS search and FAIDARE will be unified to ease the management of data sources, to bring Breeding API indexation to WheatIS and to ease development and maintenance.

### Monitor outgoing traffic towards partner databases

This metric will trace the impact of the WheatIS data portal, hence promoting its use.

### Display date of last data update

Make the data loading process smoothier and display the date of the last data update in the web interface.

## Long term perspectives

### Extend ontology annotation

The [2020 ontology annotation feature](#ontologies) is expected to be extended to other kind of documents (any document containing a supported ontology term) as weel as using other ontologies (such as [Wheat Crop ontology](http://agroportal.lirmm.fr/ontologies/CO_321/), [Plant Ontology](http://agroportal.lirmm.fr/ontologies/PO) or [Wheat Trait and Phenotype Ontology](agroportal.lirmm.fr/ontologies/WHEATPHENOTYPE)).

### Allow search for exact phrases

Allow searching group of terms linked together, ie. "_fusarium head blight_". Currently, any of the 3 terms are searched independently, resulting in a lot of false positives.

### Review the storage of data

Currently the data is stored next to the code into Git LFS. We plan to review this approach to reduce the storage cost.

### Download results

Add a download feature allowing to get batch results in a tabulated and/or JSON format. Number of results to be clarified.
