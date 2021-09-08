package fr.inra.urgi.datadiscovery.dao;

import org.springframework.data.domain.Sort;

/**
 * Interface implemented by one component per app and allowing to analyze and transform sort criteria passed when searching
 * documents
 * @author JB Nizet
 */
public interface SortAnalyzer {
    /**
     * Creates the appropriate Sort based on the given sort (or null) and the given direction (or null).
     * If any of the arguments is invalid, a BadRequestException is thrown
     */
    Sort createSort(String sort, String direction);
}
