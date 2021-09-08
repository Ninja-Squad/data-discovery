package fr.inra.urgi.datadiscovery.dao.wheatis;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.SortAnalyzer;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

/**
 * Sort analyzer for the WheatIS application
 * @author JB Nizet
 */
@Component
@Profile(AppProfile.WHEATIS)
public class WheatisSortAnalyzer implements SortAnalyzer {
    @Override
    public Sort createSort(String sort, String direction) {
        return Sort.unsorted();
    }
}
