package fr.inra.urgi.datadiscovery.dao.rare;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.SortAnalyzer;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

/**
 * Sort analyzer for the Rare application
 * @author JB Nizet
 */
@Component
@Profile({AppProfile.RARE, AppProfile.BRC4ENV})
public class RareSortAnalyzer implements SortAnalyzer {
    @Override
    public Sort createSort(String sort, String direction) {
        return Sort.unsorted();
    }
}
