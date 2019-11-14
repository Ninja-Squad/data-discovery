The implemented/explained approach is based on the article: [Patterns for Synonyms in Elasticsearch: Keyphrases](https://opensourceconnections.com/blog/2016/12/02/solr-elasticsearch-synonyms-better-patterns-keyphrases/) where the author encourages to think about synonyms in terms of keyphrases, not as the individual tokens they represent.

Two files are used here: `all_autophrases.txt` and `all_synonyms.txt`

The main idea is that during the mapping we:
1. Do the *autophrasing* using `all_autophrases.txt`
2. Next we use the synonym file `all_synonyms.txt`

### Why do we need the *autophrasing* step (Example) ?

#### The issue

*Assuming* that these are synonyms :
> Triticum aestivum, bread wheat, monocots, Canadian hard winter wheat.

We can create a synonym filter as follows:

    "wheat_syn": {
       "type": "synonym",
       "synonyms": ["triticum aestivum, bread wheat, monocots, canadian hard winter wheat"]
    }

Or we can put them in a file and point out to the file path like this:

    "wheat_syn": {
       "type": "synonym",
       "synonyms_path" : "analysis/synonym.txt"
    }

The problem is that when we map synonym straightforward as shown above, Elasticsearch don't consider/understand that we're treating `triticum aestivum` as one unit (also called `keyphrase`) instead of two individual tokens (e.g `triticum` AND `aestivum` separated)

Here's an example (shown using [elyzer](https://github.com/o19s/elyzer)) of what happens behind the scene:

    $ elyzer --es "http://localhost:9200" --index wheat_syn_ix --analyzer syn_text "bread wheat is good for health"
    TOKENIZER: standard
    {0:bread}	{1:wheat}	{2:is}	{3:good}	{4:for}	{5:health}
    TOKEN_FILTER: wheat_syn
    {0:bread,triticum,monocots,canadian}	{1:wheat,aestivum,hard}
    {2:is,winter}	{3:good,wheat}	{4:for}	{5:health}

In this example, if the user enters `bread wheat is good for health` the tokenizer tokenizes text on whitespace then applies the provided synonyms, the results will be as follows:

|   Word  |            has synonym(s)          |
|:-------:|:----------------------------------:|
|  bread  | monocots, *triticum*, **canadian** |
|  wheat  | *aestivum*, **hard**               |
|   is    | **winter**                         |
|  good   | **wheat**                          |

As we can see `triticum aestivum` and `canadian hard winter wheat` are tokenized and assigned to different terms, this unwanted behavior can be avoided using **autophrasing**.

#### The proposed solution

> *Auto phrases* refer to sequences of tokens that are meant to describe a single thing and should be searched for as such. ([Source](https://github.com/lucidworks/auto-phrase-tokenfilter))

This issue can be solved using what the author calls in his article **Autophrase With Synonym Step**</a>. The idea is to simply *autophrase* the key phrases with an additional synonym step. For example we turn `bread wheat` to `bread_wheat` and `canadian hard winter wheat` to `canadian_hard_winter_wheat` etc:


    # 1. Starting with the initial synonym step for autophrasing:
    "autophrase_syn": {
       "type": "synonym",
          "synonyms": ["triticum aestivum => triticum_aestivum",
                       "bread wheat => bread_wheat",
                       "canadian hard winter wheat => canadian_hard_winter_wheat"]
    }

And then expand the keyphrases into various synonym forms:

    # 2. We follow with appropriate synonyms:
    "wheat_syn": {
      "type": "synonym",
      "tokenizer": "keyword",
      "synonyms": [ "triticum_aestivum, bread_wheat, monocots, canadian_hard_winter_wheat" ]
    }

And our analyzer becomes:

    "analyzer": {
      "syn_text": {
        "tokenizer": "standard",
        "filter": ["lowercase", "autophrase_syn", "wheat_syn"]
      }
    }

Now `elyzer` result makes sense:

    $ elyzer --es "http://localhost:9200" --index wheat_syn --analyzer syn_text "bread wheat is good for health"
    TOKENIZER: standard
    {0:bread}	{1:wheat}	{2:is}	{3:good}	{4:for}	{5:health}
    TOKEN_FILTER: autophrase_syn
    {0:bread_wheat}	{1:is}	{2:good}	{3:for}	{4:health}
    TOKEN_FILTER: wheat_syn
    {0:bread_wheat,triticum_aestivum,monocots,canadian_hard_winter_wheat} {1:is}	{2:good}	{3:for}	{4:health}

We can see that `bread_wheat` has as synonyms `triticum_aestivum`, `monocots` and `canadian_hard_winter_wheat`

**NOTE:** We used `synonyms_path` to import *synonyms* and *autophrases* from the text files mentioned above.
