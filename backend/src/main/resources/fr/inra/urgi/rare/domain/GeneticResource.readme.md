# Mapping of genetic resources

All properties use the default analyzer except for `name`, `description` and `databaseSource`, because
they're supposed to contain small English or Latin terms, or country names, without any stopword or punctuation.

`name` uses the `french` analyzer. Many resources have a French name. Using the french analyzer allows using "ardeche" 
to find "Ardèche", for example, and allows using French punctuation (and thus allows finding "Plant d'Ardèche" when
searching for "Ardèche".

`description` uses the `english` analyzer. The description is in English, and contains actual sentences. Using the 
english analyzer allows using the English punctuation to tokenize the text, and to remove the English stopwords that
could exist in the description. The French name is often part of the description, but it's already indexed in French 
by the name property.

`databaseSource` uses the `french` analyzer. The names of the database sources are usually French names, so using the 
French analyzer makes sense. It allows for example to type "florilege" and find "Florilège".
