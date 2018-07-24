package fr.inra.urgi.rare.harvest;

import static org.assertj.core.api.Java6Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import java.io.IOException;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Unit test checking that a HarvestResult can be marshalled/unmarchalled to/from JSON
 * @author JB Nizet
 */
@JsonTest
@ExtendWith(SpringExtension.class)
class HarvestResultTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldMarshallAndUnMarshall() throws IOException {
        HarvestResult harvestResult = HarvestResult.builder()
            .addGlobalError("global error 1")
            .addGlobalError("global error 2")
            .withFile(HarvestedFile.builder("test1.json")
                                   .addSuccess()
                                   .addSuccess()
                                   .addError(2, "file error 1", 10, 1)
                                   .build())
            .withFile(HarvestedFile.builder("test2.json")
                                   .addSuccess()
                                   .addError(1, "file error 2", 12, 2)
                                   .build())
            .end();

        String json = objectMapper.writeValueAsString(harvestResult);

        HarvestResult unmarshalled = objectMapper.readValue(json, HarvestResult.class);

        assertThat(unmarshalled).isEqualTo(harvestResult);

        assertThat(unmarshalled.getId()).isNotBlank();
        assertThat(unmarshalled.getStartInstant()).isNotNull();
        assertThat(unmarshalled.getEndInstant()).isNotNull();
        assertThat(unmarshalled.getGlobalErrors()).hasSize(2);
        assertThat(unmarshalled.getFiles()).hasSize(2);

        HarvestedFile firstFile = unmarshalled.getFiles().get(0);
        assertThat(firstFile.getSuccessCount()).isEqualTo(2);
        assertThat(firstFile.getErrorCount()).isEqualTo(1);
        assertThat(firstFile.getErrors()).hasSize(1);
    }
}
