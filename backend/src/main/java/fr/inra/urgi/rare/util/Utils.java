package fr.inra.urgi.rare.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Utility methods
 * @author JB Nizet
 */
public final class Utils {
    private Utils() {
    }

    public static <T> List<T> nullSafeUnmodifiableCopy(List<T> list) {
        return list == null ? Collections.emptyList() : Collections.unmodifiableList(new ArrayList<>(list));
    }
}
