package fr.inra.urgi.datadiscovery.filter.faidare;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * Unit tests for {@link FaidareAuthenticationFilter}
 * @author JB Nizet
 */
class FaidareAuthenticationFilterTest {

    private FaidareCurrentUser currentUser;
    private FaidareUserManager mockUserManager;
    private FaidareAuthenticationFilter authenticationFilter;

    @BeforeEach
    void prepare() {
        currentUser = new FaidareCurrentUser();
        mockUserManager = mock(FaidareUserManager.class);
        authenticationFilter = new FaidareAuthenticationFilter(mockUserManager, currentUser);
    }

    @Test
    void shouldSetAnonymousUserIfNoBasicAuthHeader() throws ServletException, IOException {
        HttpServletRequest request = new MockHttpServletRequest();
        HttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = new MockFilterChain();

        authenticationFilter.doFilter(request, response, chain);
        assertThat(currentUser.get()).isEqualTo(FaidareUser.ANONYMOUS);
    }

    @Test
    void shouldSetActualUserIfBasicAuthHeader() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        HttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = new MockFilterChain();

        request.addHeader(HttpHeaders.AUTHORIZATION, "Basic " + HttpHeaders.encodeBasicAuth("john", "p4ssw0rd", StandardCharsets.UTF_8));
        FaidareUser john = new FaidareUser("john", new HashSet<>(Arrays.asList(0, 1, 2)));
        when(mockUserManager.getFaidareUser("john")).thenReturn(john);

        authenticationFilter.doFilter(request, response, chain);
        assertThat(currentUser.get()).isEqualTo(john);
    }
}
