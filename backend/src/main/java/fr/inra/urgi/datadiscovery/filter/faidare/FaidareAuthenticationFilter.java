package fr.inra.urgi.datadiscovery.filter.faidare;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;

/**
 * A filter which extracts the login from the basic auth Authorization header (checked by the reverse proxy in front of the app),
 * then gets the associated user group IDs from a cached web service call, and stores them in a request-scoped bean.
 * This request-scoped bean is in turn used by the repository to add contextual search criteria.
 * @author JB Nizet
 */
public class FaidareAuthenticationFilter implements Filter {

    private final FaidareUserManager userManager;
    private final FaidareCurrentUser currentUser;

    public FaidareAuthenticationFilter(FaidareUserManager userManager, FaidareCurrentUser currentUser) {
        this.userManager = userManager;
        this.currentUser = currentUser;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

        String authorization = ((HttpServletRequest) request).getHeader(HttpHeaders.AUTHORIZATION);
        FaidareUser user = FaidareUser.ANONYMOUS;
        if (authorization != null && authorization.startsWith("Basic")) {
            String base64Credentials = authorization.substring("Basic".length()).trim();
            String decoded = new String(Base64.getDecoder().decode(base64Credentials), StandardCharsets.UTF_8);
            String login = decoded.substring(0, decoded.indexOf(':'));
            user = userManager.getFaidareUser(login);
        }
        currentUser.set(user);

        chain.doFilter(request, response);
    }
}
