package fr.inra.urgi.datadiscovery.ontology;

import org.springframework.beans.factory.annotation.Qualifier;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Qualifier annotation for ontology
 * @author JB Nizet
 */
@Qualifier
@Retention(RetentionPolicy.RUNTIME)
public @interface Ontology {
}
