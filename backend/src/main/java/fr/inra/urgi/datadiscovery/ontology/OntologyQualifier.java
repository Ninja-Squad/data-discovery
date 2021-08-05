package fr.inra.urgi.datadiscovery.ontology;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import org.springframework.beans.factory.annotation.Qualifier;

/**
 * Qualifier annotation for ontology
 * @author JB Nizet
 */
@Qualifier
@Retention(RetentionPolicy.RUNTIME)
public @interface OntologyQualifier {
}
