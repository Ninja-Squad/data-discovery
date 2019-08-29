package fr.inra.urgi.datadiscovery.domain;

/**
 * Interface common to all documents that can be manipulated by this application, for sugesting or for searching.
 * Known implementations:
 * <ul>
 *     <li>{@link fr.inra.urgi.datadiscovery.domain.SuggestionDocument SuggestionDocument}</li>
 *     <li>{@link fr.inra.urgi.datadiscovery.domain.SearchDocument SearchDocument}, itself implemented by:</li>
 *     <ul>
 *         <li>{@link fr.inra.urgi.datadiscovery.domain.wheatis.WheatisDocument WheatisDocument}</li>
 *         <li>{@link fr.inra.urgi.datadiscovery.domain.rare.RareDocument RareDocument}</li>
 *     </ul>
 * </ul>
 * @author R. Flores
 */
public interface Document {

}
