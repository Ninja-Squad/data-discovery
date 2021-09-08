package fr.inra.urgi.datadiscovery.dao.faidare;

import java.util.Arrays;
import java.util.Collections;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.SortAnalyzer;
import fr.inra.urgi.datadiscovery.exception.BadRequestException;
import org.elasticsearch.common.Strings;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

/**
 * Sort analyzer for the Faidare application
 * @author JB Nizet
 */
@Component
@Profile({AppProfile.FAIDARE})
public class FaidareSortAnalyzer implements SortAnalyzer {

    private final Map<String, FaidareSort> faidareSortsByName =
        Collections.unmodifiableMap(
            Arrays.stream(FaidareSort.values()).collect(Collectors.toMap(FaidareSort::getName, Function.identity()))
        );

    @Override
    public Sort createSort(String sort, String direction) {
        if (Strings.isEmpty(sort)) {
            return Sort.unsorted();
        }
        FaidareSort faidareSort = faidareSortsByName.get(sort);
        if (faidareSort == null) {
            throw new BadRequestException("Invalid sort: " + sort);
        }
        Sort.Direction sortDirection = Sort.Direction.ASC;
        if (!Strings.isEmpty(direction)) {
            try {
                sortDirection = Sort.Direction.fromString(direction);
            }
            catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid sort direction: " + direction);
            }
        }
        return faidareSort.toSort(sortDirection);
    }
}
