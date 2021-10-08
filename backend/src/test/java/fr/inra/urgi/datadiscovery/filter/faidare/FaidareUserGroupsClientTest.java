package fr.inra.urgi.datadiscovery.filter.faidare;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.Set;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.json.JSONException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Unit tests for {@link FaidareUserGroupsClient}
 * @author JB Nizet
 */
@RestClientTest
class FaidareUserGroupsClientTest {
    @Autowired
    private WebClient.Builder webClientBuilder;

    private FaidareUserGroupsClient client;
    private MockWebServer server;

    @BeforeEach
    void prepare() {
        server = new MockWebServer();
        client = new FaidareUserGroupsClient(webClientBuilder, new FaidareUserGroupsProperties(server.url("").toString(), "the-token"));
    }

    @AfterEach
    void tearDown() throws IOException {
        server.shutdown();
    }

    @Test
    void shouldGetUserGroups() throws InterruptedException, JSONException {
        server.enqueue(
            new MockResponse()
                .addHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .setBody("[1, 2, 3]")
        );

        Set<Integer> groups = client.loadUserGroups("john").block();

        assertThat(groups).containsOnly(1, 2, 3);

        RecordedRequest request = server.takeRequest();
        assertThat(request.getRequestUrl().queryParameter("token")).isEqualTo("the-token");
        assertThat(request.getRequestUrl().queryParameter("userName")).isEqualTo("john");
    }
}
