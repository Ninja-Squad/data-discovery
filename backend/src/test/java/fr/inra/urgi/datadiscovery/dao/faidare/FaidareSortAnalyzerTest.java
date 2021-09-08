package fr.inra.urgi.datadiscovery.dao.faidare;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import fr.inra.urgi.datadiscovery.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;

/**
 * Unit tests for {@link FaidareSortAnalyzer}
 * @author JB Nizet
 */
class FaidareSortAnalyzerTest {

    FaidareSortAnalyzer analyzer = new FaidareSortAnalyzer();

    @Test
    void shouldCreateSortWhenValidNameIsPassed() {
        assertThat(analyzer.createSort(FaidareSort.BOLOGICAL_STATUS.getName(), "asc"))
            .isEqualTo(Sort.by(Sort.Direction.ASC, "biologicalStatus.keyword"));

        assertThat(analyzer.createSort(FaidareSort.BOLOGICAL_STATUS.getName(), "desc"))
            .isEqualTo(Sort.by(Sort.Direction.DESC, "biologicalStatus.keyword"));

        assertThat(analyzer.createSort(FaidareSort.BOLOGICAL_STATUS.getName(), null))
            .isEqualTo(Sort.by(Sort.Direction.ASC, "biologicalStatus.keyword"));
    }

    @Test
    void shouldThrowWhenInvalidNameIsPassed() {
        assertThatExceptionOfType(BadRequestException.class).isThrownBy(() -> analyzer.createSort("foobar", "asc"));
    }

    @Test
    void shouldThrowWhenInvalidDirectionIsPassed() {
        assertThatExceptionOfType(BadRequestException.class).isThrownBy(() -> analyzer.createSort(FaidareSort.BOLOGICAL_STATUS.getName(), "foo"));
    }
}
