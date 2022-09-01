package fr.inra.urgi.datadiscovery.dao.faidare;

import java.util.Set;

import fr.inra.urgi.datadiscovery.dao.DocumentDaoCustom;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.domain.faidare.FaidareDocument;

/**
 * Custom methods of the {@link FaidareDocumentDao}
 * @author JB Nizet
 */
public interface FaidareDocumentDaoCustom extends DocumentDaoCustom<FaidareDocument> {
    Set<String> findAllIds(String query, boolean descendants, SearchRefinements refinements);
    Set<String> findAllIds(String query, boolean descendants, SearchRefinements refinements, String idFieldName);
}
