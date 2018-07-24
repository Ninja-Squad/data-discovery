package fr.inra.urgi.rare.dao;

import static org.assertj.core.api.Assertions.assertThat;

import fr.inra.urgi.rare.config.ElasticSearchConfig;
import fr.inra.urgi.rare.harvest.HarvestResult;
import fr.inra.urgi.rare.harvest.HarvestedFile;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Import;
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
}
