# Rejoindre la fédération RARe

Si vous souhaitez que votre système d'information soit référencé, vous devez fournir des fichiers [TSV](#tsv-tabulation-separated-values) ou [JSON](#json-javascript-object-notation) avec uniquement les métadonnées nécessaires.
Le format des métadonnées doit suivre les indications ci-dessous (voir [Specifications des données](#spécifications-de-données)).
Nous vous invitons à [nous contacter](mailto:urgi-data@inrae.fr?subject=%5BRARe%20portal%5D) dès que possible pour que nous puissions vous aider et discuter ensemble du meilleur moyen d'avancer.

Veuillez noter que puisque l'outil affiche des liens vers votre système d'information, une URL permettant aux utilisateurs d'obtenir des informations détaillées sur les données indexées est nécessaire.

## Spécifications de données

Soyez conscient que toutes les données que vous nous fournissez doivent être en accès libre.

Une entité (document) doit être créée pour chaque objet recherchable.
Chaque entité (document) est décrite avec les champs suivants :

### pillarName

Nom de votre pilier.
Il doit être identique pour toutes les entités que vous gérez.

Cette valeur est contrainte. Vous devez utiliser l'une des valeurs suivantes :

- Pilier Animal
- Pilier Environnement
- Pilier Forêt
- Pilier Micro-organisme
- Pilier Plante

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | L'un de ceux de la liste fournie |

### databaseSource

Nom de la base de données à partir de laquelle les entités sont extraites.
Ce nom peut différer d'une entité à l'autre au sein de vos données si vous les extrayez de systèmes d'information différents.

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | Aucune |

### portalURL

L'URL permettant d'accéder au site web du système d'information source duquel l'entité a été extraite (`databaseSource`).
L'URL doit être valide car elle permet de renvoyer vers votre système d'information.

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | Aucune |

### identifier

L'identifiant de votre entité.
Il est utilisé pour identifier précisément et de manière unique l'entité parmi toutes les données ; il n'est pas affiché dans l'interface de recherche. Vous devez vous assurer qu'il est unique au sein de votre jeu de données et il sera complété lors de l'indexation pour être rendu unique parmi l'ensemble des données du portail.

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | Unique parmi tous les piliers |

### name

Le nom de l'entité.
Cette valeur doit être unique au sein de votre jeu de données et suffisamment claire pour aider les utilisateurs à identifier en un coup d'œil cette entité parmi les autres.

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | Unique au sein de votre pilier |

### description

Description de l'entité.
Ce champ doit contenir tous les mots clés pertinents pour pouvoir trouver votre entité et pour savoir à quoi elle correspond.

C'est le champ le plus important pour la découvrabilité des données puisque c'est le principal champ utilisé pour rechercher les termes entrés par les utilisateurs.
Il vous revient de fournir la description la plus pertinente pour trouver l'entité, mais gardez en tête que plus la description sera précise et concise, meilleur sera le classement dans les résultats de recherche.

L'outil de recherche repose sur Elasticsearch. Ce dernier s'appuie sur des index Apache Lucene dont le classement est fonction d'un ratio entre la fréquence des termes recherchés par rapport à la fréquence inverse des documents (l'algorithme utilisé à ce jour est le BM25).
Cela signifie que si le terme recherché est contenu plusieurs fois dans la description d'une entité mais qu'il est rare dans le reste du corpus, cette entité sera très probablement retournée avec un meilleur score.
Vous pouvez obtenir de plus amples informations sur ce fonctionnement en suivant le lien suivant : [similarité dans Elasticsearch (EN)](https://www.elastic.co/blog/found-similarity-in-elasticsearch).

Cependant, soyez conscient que le contenu des autres champs (nom de l'entrée, espèce etc...) peuvent également être utilisés pour la recherche.
Il n'est donc pas nécessaire de les ajouter explicitement dans la description.

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | Aucune |

### dataURL

L'URL permettant d'accéder à l'entité sur le site web de la base de données de laquelle d'entité a été extraite (`databaseSource`).
Ce doit être une URL valide qui permet de renvoyer vers votre système d'information.

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | Aucune |

### domain

Domaine taxonomique de l'entité.

Cette valeur est contrôlée. Vous devez utiliser l'une des valeurs suivantes, celle se rapprochant le mieux de vos données :

- Animalia
- Archaea
- Bacteria
- Chromista
- Fungi
- Plantae
- Protozoa
- Environment sampling
- Consortium

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | L'un de ceux de la liste fournie |

### taxon

Le genre ou l'espèce (dans la forme binomiale) de l'entité, sans l'abbrévation de l'auteur (par ex. _Populus_, _Vitis vinifera_).

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | Aucune |

### materialType

Le type de matériel biologique disponible pour cette entité.

Cette valeur est contrôlée. Vous devez utiliser l'une des valeurs suivantes, celle se rapprochant le mieux de vos données :

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

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Optionnel | 1 | L'un de ceux de la liste fournie |

### biotopeType

Le biotope ou l'habitat principal dans lequel l'entité vit.

Cette valeur est contrôlée. Vous devez utiliser l'une des valeurs suivantes, celle se rapprochant le mieux de vos données :

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

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Optionnel | 1 | L'un de ceux de la liste fournie |

### countryOfOrigin

Le pays duquel l'entité provient à l'origine.

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Optionnel | 1 | Aucune |

### originLatitude

La latitude de la localisation d'origine de l'entité.
Elle doit prendre la forme de degré décimal (par ex. `3.9988889` pour les coordonnées GPS `3.9988889,-53`).

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Optionnel | 1 | -90 < Lat. < 90 |

### originLongitude

La longitude de la localisation d'origine de l'entité.
Elle doit prendre la forme de degré décimal (par ex. `-53` pour les coordonnées GPS `3.9988889,-53`).

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Optionnel | 1 | -180 < Long. < 180 |

### countryOfCollect

Le pays dans lequel l'entité à été collectée.

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Optionnel | 1 | Aucune |

### collectLatitude

La latitude du lieu de collecte de l'entité.
Elle doit prendre la forme de degré décimal (par ex. `3.9988889` pour les coordonnées GPS `3.9988889,-53`).

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Optionnel | 1 | -90 < Lat. < 90 |

### collectLongitude

La longitude du lieu de collecte de l'entité.
Elle doit prendre la forme de degré décimal (par ex. `-53` pour les coordonnées GPS `3.9988889,-53`).

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Optionnel | 1 | -180 < Long. < 180 |

### accessionHolder

Le nom du CRB responsable de distribuer les ressources. Dans certains cas, ça sera la même valeur que le champ `databaseSource`. Dans d'autres cas, cela peut différer, en particulier lorsque les gestionnaires d'un même CRB sont répartis sur des sites géographiques distincts.
Ce champ optionel est utilisé pour commander des ressources génétiques, il nous permet de savoir qui est le gestionnaire à contacter pour distribuer l'accession.

Puisque cette valeur est utilisée pour lier une accession à son gestionnaire, elle est contrôlée. Vous devriez utiliser l'une des valeurs ci-dessous.
Si votre CRB est absent, veuillez nous contacter pour que nous puissions l'ajouter :

- CBGP
- Colisa
- EP-Coll
- TCC
- Forest BRC - Avignon
- Forest BRC - Pierroton
- Forest BRC - Orléans

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Optionnel | 1 | L'un de ceux de la liste fournie |

[&#8593;](#top)

## Format des données

Comment formater les données à nous envoyer ?

Vous pouvez utiliser un fichier au format [TSV](#tsv-tabulation-separated-values) ou [JSON](#json-javascript-object-notation).
Les fichiers peuvent soit nous être envoyés, soit être publiés sur un site web où ils seront régulièrement mis à jour (voir la section [Disponibilité des données et mises à jour](#disponibilité-des-données-et-mises-à-jour)).

### TSV (Tabulation Separated Values)

L'ordre des champs importe, comme dans tout fichier tabulé.
Prenez soin de retirer toute tabulation ou tout caractère de nouvelle ligne éventuelement contenus dans les différents champs afin de rester compatible avec le format attendu.
Aucun caractère de citation n'est attendu.

<!-- markdownlint-disable MD009 MD010 -->
```csv
#pillarName	databaseSource	portalURL	identifier	name	description	dataURL	domain	taxon	materialType	biotopeType	countryOfOrigin	originLatitude	originLongitude	countryOfCollect	collectLatitude	collectLongitude	accessionHolder
Pilier Forêt	Forest Tree GnpIS	https://urgi.versailles.inra.fr/faidare/?germplasmLists=Forest%20BRC	https://doi.org/10.15454/0FZNAO	661300375	661300375 is a Populus x generosa accession (number: 661300375, https://doi.org/10.15454/0FZNAO) maintained by the Forest BRC (managed by INRA) and held by INRA-ONF. It is a clone/clone of biological Statut interspecific cross/croisement interspécifique. This accession is also known as: 0054B165. This accession is part of collection(s): breeding_gispeuplier, mapping_pedigree_0504B. This accession has phenotyping data: bacterial canker resistance test of mapping pedigree 0504B, clonal test of mapping pedigree 0504B in nursery. This accession has genotyping data: Popyomics_Orleans	https://urgi.versailles.inrae.fr/faidare/germplasm?pui=https://doi.org/10.15454/0FZNAO	Plantae	Populus x generosa	Specimen							Forest BRC - Orléans
Pilier Micro-organisme	CIRM-CF	http://139.124.42.231/~davnav/BRFM/search_strain2.php	BRFM 902	BRFM 902	Pycnoporus sanguineus BRFM 902 GUY110 burnt wood, Macouria Polyporaceae Polyporales Basidiomycota	http://139.124.42.231/~davnav/BRFM/fiche.php?BRFM_Number=902	Fungi	Pycnoporus sanguineus		Wood	French Guiana	3.9988889	-53	French Guiana	3.9988889	-53	
```
<!-- markdownlint-enable MD009 MD010 -->

### JSON (JavaScript Object Notation)

L'ordre de déclaration des champs n'est pas important. Toutes les entités d'un même fichier doivent être contenues dans un unique tableau JSON.

```json
[
  {
    "pillarName": "Pilier Forêt",
    "databaseSource": "Forest Tree GnpIS",
    "portalURL": "https://urgi.versailles.inra.fr/gnpis-core/#form/germplasmLists=Forest+BRC",
    "identifier": "https://doi.org/10.15454/0FZNAO",
    "name": 661300375,
    "description": "661300375 is a Populus x generosa accession (number: 661300375, https://doi.org/10.15454/0FZNAO) maintained by the Forest BRC (managed by INRA) and held by INRA-ONF. It is a clone/clone of biological Statut interspecific cross/croisement interspécifique. This accession is also known as: 0054B165. Its taxon is also known as: P. deltoides x P. trichocarpa, Populus deltoides x Populus trichocarpa, Populus trichocarpa x Populus deltoides, Populus x generosa A. Henry, Populus x interamericana, P. trichocarpa x P. deltoides, P. xgenerosa Henry, P xinteramericana. This accession is part of collection(s): breeding_gispeuplier, mapping_pedigree_0504B. This accession has phenotyping data: bacterial canker resistance test of mapping pedigree 0504B - QTL mapping of bacterial canker resistance, clonal test of mapping pedigree 0504B in nursery - QTL mapping of a list of phenotypic traits. This accession has genotyping data: Popyomics_Orleans",
    "dataURL": "https://urgi.versailles.inra.fr/gnpis-core/#accessionCard/pui=https://doi.org/10.15454/0FZNAO",
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

## Disponibilité des données et mises à jour

Vous pouvez générer un ou plusieurs fichiers contenant vos données publiques dés lors qu'elles sont compatibles avec le format défini ci-dessus.

Une fois générés, vous devrez nous fournir un moyen de récupérer ces fichiers sur une base régulière. Nous pouvons vous accompagner pour décider le meilleur moyen d'y parvenir. Utiliser un simple serveur web (ou FTP) est une possibilité intéressante puisqu'elle nous permet de tester si un nouvelle version de vos fichiers a été produite.

[&#8593;](#top)
