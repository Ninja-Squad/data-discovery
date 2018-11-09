package fr.inra.urgi.datadiscovery.config;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import org.springframework.beans.factory.annotation.Qualifier;

/**
 * Qualifier annotation for beans used by the harvesting process
 * @author JB Nizet
 */
@Retention(RetentionPolicy.RUNTIME)
@Qualifier("harvest")
public @interface Harvest {
}
