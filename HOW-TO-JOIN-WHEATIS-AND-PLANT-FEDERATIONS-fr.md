# Rejoindre la fédération plantes/WheatIS de recherche de données


Si vous souhaitez que votre système d'information soit référencé, vous devez fournir des fichiers [TSV](#tsv-tabulation-separated-values) ou [JSON](#json-javascript-object-notation) avec uniquement les métadonnées nécessaires.
Le format des métadonnées doit suivre les indications ci-dessous (voir [Specifications des données](#spécifications-de-données)).
Nous vous invitons à [nous contacter](mailto:urgi-contact@inrae.fr?subject=%5BRARe%20portal%5D) dès que possible pour que l'on puisse vous guider et discuter du meilleur moyen d'avancer.
Veuillez noter que puisque l'outil présente des hyperliens vers votre système d'information, une URL, permettant aux utilisateurs d'obtenir des informations détaillées sur les données indexées, est nécessaire.

## Aperçu des métadonnées associées à chaque entité recherchable

- un court _[nom (`name`)](#name)_ identifiant uniquement l'entité, par ex. `BTH_Le_Moulon_2000_SetA`
- une _[URL (`url`](#url)_ servant d'hyperlien retour vers l'entité dans votre propre système d'information, par ex. https://urgi.versailles.inrae.fr/ephesis/ephesis/viewer.do#trialCard/trialId=56
- une _[description (`description`)](#description)_ de l'entité qui contient tous les termes pertinents permettant de la retrouver. Tous les termes de ce champs seront utilisés par l'application de recherche pour retrouver les entités
- un _[type d'entité (`entryType`)](#entrytype)_ décrivant la nature de l'entité, ce pourrait être n'importe lequel des éléments listés dans la section dédiée ci-dessous
- un champ _[espèce (`species`)](#species)_, contenant le nom de l'espèce liée à l'entité (zéro, une ou plusieurs, même si en fournir au moins une est recommandé)
- un _[noeud (`node`)](#node)_, le nom de votre laboratoire/institut, il devrait être le même pour toutes les entités que vous gérez
- une _[base de données (`databaseName`)](#databasename)_, le nom de la base de données de laquelle l'entité a été extraite. Ce nom peut différer d'une entité à l'autre si vous fournissez des données de plusieurs bases différentes

### Spécifications détaillées des champs de métadonnées

#### name
[&#8593;](#top)

La valeur du champ `name` doit être unique au sein de votre jeu de données, et suffisamment claire pour aider les utilisateurs à identifier en un coup d'œil cette entité parmi les autres.

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | Unique |

---

#### entryType
[&#8593;](#top)

Le champ `entryType` n'est pas contrôlé finement (il n'est pas implémenté en tant qu'énumération) mais il est fortement recommandé de réutiliser l'une des valeurs suivantes s'approchant le plus de vos données :

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

> **Note:** observer dans le portail [data-discovery](https://urgi.versailles.inrae.fr/data-discovery) portal le nombre de documents correspondant à un type d'entité (voir le filtre `Data type` sur la gauche) peut aider à choisir le type de données ayant le sens le plus proche. Si besoin, vous pouvoir toujours choisir un type différent que ceux déjà disponibles, nous évaluerons ensuite lors de l'intégration sa pertinence.

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | L'un de ceux de la liste fournie |

---

#### description
[&#8593;](#top)

Le champ `description` est le plus important pour la découvrabilité des données puisque c'est le principal champ utilisé pour rechercher les termes entrés par les utilisateurs.
Il vous revient de fournir la description la plus pertinente pour permettre de trouver l'entité, mais gardez en tête que la plus précise et concise est la description, meilleur sera le classement dans les résultats de recherche.

L'outil de recherche repose sur Elasticsearch. Ce dernier s'appuie sur des index Apache Lucene dont le classement est fonction d'un ratio entre la fréquence des termes recherchés par rapport à la fréquence inverse des documents (l'algorithme utilisé à ce jour est le BM25).
Cela signifie qu'une entité ayant une description avec le terme recherché apparaissant plusieurs fois dans la description mais dont le même terme est rare dans le reste du corpus, sera très probablement retourné avec un meilleur score.
Vous pourrez obtenir de plus amples informations sur le fonctionnement de la [similarité dans Elasticsearch (EN)](https://www.elastic.co/blog/found-similarity-in-elasticsearch).

Cependant, soyez conscient que le contenu des autres champs peuvent aussi être utilisés pour la recherche.
Il n'est donc pas nécessaire de les ajouter explicitement dans la description.

>>>
Note: soyez bien conscient que toutes les données que vous fournissez doivent être en accès ouvert.
>>>

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | Aucune |

---

#### url
[&#8593;](#top)

Le champ `url` doit être une URL valide pour pouvoir servir de rétrolien vers votre système d'information affichant les données détaillées sur l'entité.

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | Aucune |

---

#### species
[&#8593;](#top)

Le champ `species` n'est pas obligatoire, mais il peut être utilisé pour filtrer les données. Il peut contenir zéro, une ou plusieurs valeurs selon le type de l'entité.  
Il est recommandé de favoriser la forme binomiale sans l'abbrévation de l'auteur (par ex. `L.`), tel que _Vitis vinifera_, _Quercus robur_, _Triticum aestivum_.

>>>
Note: pour la fédération WheatIS en particulier, l'espèce doit correspondre à l'une des valeurs ci-dessous pour pouvoir être visible dans [l'outil de recherche WheatIS](https://urgi.versailes.inrae.fr/wheatis), autrement l'entité sera exclue de la recherche. Notez que si vous fournissez des données liées au blé et des données d'autres espèces non apparentées, il n'est pas nécessaire de les fournir en doublon des des fichiers distincts, le processus de chargement se chargement de générér les index pertinent pour le portail de recherche généraliste des plantes et pour le portail WheatIS.

- Aegilops*
- Hordeum*
- Triticum*
- Wheat*
>>>

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Optionnel, mais recommandé | 0-* | Aucune |

---

#### databaseName
[&#8593;](#top)

Le nom de la base de données (`databaseName`) de laquelle l'entité a été extraite. Ce nom peut différer d'une entité à l'autre parmi vos données si vous les extrayez de systèmes d'information différents.

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | Aucune |

---

#### node
[&#8593;](#top)

Le nœud (`node`) est le nom de votre laboratoire ou institut, il devrait être le même pour toutes les entités que vous gérez, par ex. _INRAE-URGI_, _EBI_, _IPK_, _USDA-ARS_, _CIMMYT_...

| Statut | Cardinalité | Contraintes |
| :---: | :---: | :---: |
| Obligatoire | 1 | Devrait être le même pour toutes les données que vous fournissez |

---

## Formattage

Comment formater les données à nous envoyer ?

Vous pouvez utiliser un fichier au format [TSV](#tsv-tabulation-separated-values) ou [JSON](#json-javascript-object-notation).
Le(s) fichier(s) peuvent soit nous être envoyés, soit être publiés sur un site web où il sera(-ont) régulièrement mis à jour (voir la section [Disponibilité des données et mises à jour](#disponibilité-des-données-et-mises-à-jour)).
Ci-dessous vous trouverez deux exemples de ce qui est attendu avec deux entités dans les deux formats :

### TSV (Tabulation Separated Values)
[&#8593;](#top)

L'ordre des champs importe, comme dans tout fichier tabulé.
Prenez soin de retirer toute tabulation ou tout caractère de nouvelle ligne des différents champs de sorte à rester compatible avec le format attendu.
Aucun caractère de citation n'est attendu.

L'en-tête n'est pas nécessaire, il est simplement affiché ici pour les besoin de documentation.

```csv
##name   entryType   node    databaseName    url species description
TRIAL_BTH_Le_Moulon_2000_SetA	Phenotyping study	INRAE-URGI	GnpIS	https://urgi.versailles.inrae.fr/ephesis/ephesis/viewer.do#trialCard/trialId=56	Triticum aestivum aestivum	BTH_Le_Moulon_2000_SetA is a trial lead at site: Le Moulon. Observation variables: WIPO:0000070 , WIPO:0000074 , WIPO:0000109 , WIPO:0000217 , WIPO:0000218 , WIPO:0000219 . This trial started on 1999-10-20 and finished on 2000-07-31, in the frame of project: 'INRA_Wheat_Breeding_Network'. Accession names: AO00001, AO99001, CF9804, CF9825, CF99002, CF99003, CF99005, CF99007, CF99009, CF99016, CF99027, CF99031, CHARGER, DI9714, DI9812, EM99001, EM99002, EM99003, EM99006, EM99012, EM99017, EM99021, EM99027, HA1066.146, HA1070.50, HA1541.134, ISENGRAIN, RE9819, RE99002, RE99003, RE99004, RE99006, RE99007, RE99009, RE99014, RE99016, RE99017, RE99018, Ressor, SOISSONS, TREMIE, VOLTIGE
10883/2969  Bibliography    CIMMYT  CIMMYT Dspace   http://hdl.handle.net/10883/2969    Septoria tritici blotch,Triticum aestivum l.,Wheat  Genetic analysis and mapping of seedling resistance to Septoria tritici blotch in 'Steele-ND'/'ND 735' bread wheat population 2013-01-01 Genetic analysis and mapping of seedling resistance to Septoria tritici blotch in 'Steele-ND'/'ND 735' bread wheat population Article
```

### JSON (JavaScript Object Notation)
[&#8593;](#top)

L'ordre de déclaration des champs n'est pas important. Toutes les entités d'un même fichier doivent être contenues dans un unique tableau JSON.

```json
[
  {
    "entryType": "Phenotyping study",
    "node": "INRAE-URGI",
    "databaseName": "GnpIS",
    "description": "BTH_Le_Moulon_2000_SetA is a trial lead at site: Le Moulon. Observation variables: WIPO:0000070 , WIPO:0000074 , WIPO:0000109 , WIPO:0000217 , WIPO:0000218 , WIPO:0000219 . This trial started on 1999-10-20 and finished on 2000-07-31, in the frame of project: 'INRA_Wheat_Breeding_Network'. Accession names: AO00001, AO99001, CF9804, CF9825, CF99002, CF99003, CF99005, CF99007, CF99009, CF99016, CF99027, CF99031, CHARGER, DI9714, DI9812, EM99001, EM99002, EM99003, EM99006, EM99012, EM99017, EM99021, EM99027, HA1066.146, HA1070.50, HA1541.134, ISENGRAIN, RE9819, RE99002, RE99003, RE99004, RE99006, RE99007, RE99009, RE99014, RE99016, RE99017, RE99018, Ressor, SOISSONS, TREMIE, VOLTIGE",
    "url": "https://urgi.versailles.inrae.fr/ephesis/ephesis/viewer.do#trialCard/trialId=56",
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


## Disponibilité des données et mises à jour
[&#8593;](#top)

Vous pouvez générer un ou plusieurs fichiers contenant vos données publiques dés lors qu'elles sont compatibles avec le format défini ci-dessus.

Une fois générés, vous devrez nous fournir un moyen de les récupérer sur une base régulière. Nous pouvons vous accompagner pour décider le meilleur moyen d'y parvenir. Utiliser un simple serveur web (ou FTP) est une possibilité intéressante puisqu'elle nous permet de tester si un nouvelle version de vos fichiers a été produite.


