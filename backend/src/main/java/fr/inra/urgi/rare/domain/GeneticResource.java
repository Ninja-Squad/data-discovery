package fr.inra.urgi.rare.domain;

/**
 * Interface common to all genetic resources that can be indexed and searched by this application.
 * One implementation exists for each app: one for Rare, one for WheatIS, etc.
 * @author JB Nizet
 */
public interface GeneticResource {

    /**
     * The value used to index null values, in order to be able to create a refinement query for this value.
     * Note that this value is only used when a field has the value `null`. If a field is an empty array, it's
     * considered by ElasticSearch as missing.
     */
    String NULL_VALUE = "NULL";

    /**
     * Returns the ID of the genetic resource
     */
    String getId();

    /**
     * Returns the description of the genetic resource
     */
    String getDescription();
}
