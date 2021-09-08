package fr.inra.urgi.datadiscovery.config.faidare;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import org.springframework.beans.factory.annotation.Qualifier;

/**
 * Qualifier annotation for faidare
 * @author JB Nizet
 */
@Qualifier
@Retention(RetentionPolicy.RUNTIME)
public @interface FaidareQualifier {
}
