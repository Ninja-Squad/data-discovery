package fr.inra.urgi.datadiscovery.germplasm.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.json.JSONException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

/**
 * Unit tests for {@link FaidareApiService}
 * @author JB Nizet
 */
@RestClientTest
class FaidareApiServiceTest {
    @Autowired
    private WebClient.Builder webClientBuilder;
    private FaidareApiService faidareApiService;
    private MockWebServer server;

    @BeforeEach
    void prepare() {
        server = new MockWebServer();
        faidareApiService = new FaidareApiService(webClientBuilder.baseUrl(server.url("").toString()).build());
    }

    @AfterEach
    void tearDown() throws IOException {
        server.shutdown();
    }

    @Test
    void shouldExportGermplasms() throws InterruptedException, JSONException {
        String expectedCsv = createLargeCsv();
        server.enqueue(
            new MockResponse()
                .addHeader("Content-Type", MediaType.parseMediaType("text/csv"))
                .setBody(expectedCsv)
        );
        GermplasmExportCommand command = new GermplasmExportCommand(
            new HashSet<>(Arrays.asList("a", "b")),
            Collections.emptyList()
        );
        Flux<DataBuffer> result = faidareApiService.export(command);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DataBufferUtils.write(result, baos).blockLast();
        String actualBody = new String(baos.toByteArray(), StandardCharsets.UTF_8);

        assertThat(actualBody).isEqualTo(expectedCsv);

        RecordedRequest request = server.takeRequest();
        //language=JSON
        String expectedJson = "{\n" +
            "  \"ids\":" +
            " [\"a\", \"b\"],\n" +
            "  \"fields\": []\n" +
            "}";
        JSONAssert.assertEquals(expectedJson, request.getBody().readUtf8(), false);
    }

    private String createLargeCsv() {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < 10_000; i++) {
            builder.append("a" + i + ";b" + i + ";c" + i + "\n");
        }
        return builder.toString();
    }
}
