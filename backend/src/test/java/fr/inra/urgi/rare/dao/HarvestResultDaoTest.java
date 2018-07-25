package fr.inra.urgi.rare.dao;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import fr.inra.urgi.rare.config.ElasticSearchConfig;
import fr.inra.urgi.rare.harvest.HarvestResult;
import fr.inra.urgi.rare.harvest.HarvestedFile;
import org.assertj.core.groups.Tuple;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Unit tests for {@link HarvestResultDao}
 * @author JB Nizet
 */
@ExtendWith(SpringExtension.class)
@TestPropertySource("/test.properties")
@Import(ElasticSearchConfig.class)
@JsonTest
class HarvestResultDaoTest {
    @Autowired
    private HarvestResultDao harvestResultDao;

    @BeforeEach
    public void prepare() {
        harvestResultDao.deleteAll();
    }

    @Test
    void shouldSaveAndGet() {

        HarvestResult harvestResult =
            HarvestResult.builder()
                         .addGlobalError("err1")
                         .withFile(HarvestedFile.builder("file1.json")
                                                .addSuccess()
                                                .addError(1, "err", 10, 20)
                                                .build())
                         .end();

        harvestResultDao.save(harvestResult);

        assertThat(harvestResultDao.findById(harvestResult.getId()).get()).isEqualTo(harvestResult);
    }

    @Test
    void shouldList() {
        Instant now = Instant.now();
        List<HarvestResult> harvestResults =
            Arrays.asList(
                HarvestResult.builder().withStartInstant(now.minus(Duration.ofDays(2))).end(),
                HarvestResult.builder().withStartInstant(now.minus(Duration.ofDays(1))).end(),
                HarvestResult.builder().withStartInstant(now).build());

        harvestResultDao.saveAll(harvestResults);

        PageRequest firstPageRequest = PageRequest.of(0, 2);
        Page<HarvestResult> firstPage = harvestResultDao.list(firstPageRequest);
        assertThat(firstPage.getTotalElements()).isEqualTo(3);
        assertThat(firstPage.getTotalPages()).isEqualTo(2);
        assertThat(firstPage.getContent())
            .extracting(HarvestResult::getId,
                        HarvestResult::getStartInstant,
                        HarvestResult::getEndInstant)
            .containsExactly(Tuple.tuple(harvestResults.get(2).getId(),
                                         harvestResults.get(2).getStartInstant(),
                                         harvestResults.get(2).getEndInstant()),
                             Tuple.tuple(harvestResults.get(1).getId(),
                                         harvestResults.get(1).getStartInstant(),
                                         harvestResults.get(1).getEndInstant()));

        PageRequest secondPageRequest = PageRequest.of(1, 2);
        Page<HarvestResult> secondPage = harvestResultDao.list(secondPageRequest);
        assertThat(secondPage.getContent())
            .extracting(HarvestResult::getId)
            .containsExactly(harvestResults.get(0).getId());
    }
}
