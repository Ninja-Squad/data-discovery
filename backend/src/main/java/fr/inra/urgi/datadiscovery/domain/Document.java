package fr.inra.urgi.datadiscovery.domain;

/**
 * Interface common to all documents that can be indexed and searched by this application.
 * One implementation exists for each app: one for Rare, one for WheatIS, etc.
 * @author JB Nizet
 */
public interface Document {

    /**
     * The value used to index null values, in order to be able to create a refinement query for this value.
     * Note that this value is only used when a field has the value `null`. If a field is an empty array, it's
     * considered by ElasticSearch as missing.
     */
    String NULL_VALUE = "NULL";

    /**
     * Returns the ID of the document
     */
    String getId();

    /**
     * Returns the description of the document
     */
    String getDescription();
}
