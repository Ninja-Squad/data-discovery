package fr.inra.urgi.datadiscovery;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;

/**
 * Filter that forwards all GET requests to non-static and non-api resources to index.html. This filter is necessary
 * to support deep-linking for URLs generated by the Angular router.
 * @author JB Nizet
 */
@Component
@WebFilter("/*")
public class IndexFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req,
                         ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        if (mustForward(request)) {
            request.getRequestDispatcher("/index.html").forward(request, response);
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean mustForward(HttpServletRequest request) {
        if (!request.getMethod().equals("GET")) {
            return false;
        }

        String fullUri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String uri = fullUri.substring(contextPath.length());

        return !(uri.startsWith("/api")
            || uri.endsWith(".js")
            || uri.endsWith(".css")
            || uri.startsWith("/index.html")
            || uri.endsWith(".ico")
            || uri.endsWith(".png")
            || uri.endsWith(".jpg")
            || uri.endsWith(".gif")
            || uri.endsWith(".eot")
            || uri.endsWith(".svg")
            || uri.endsWith(".woff2")
            || uri.endsWith(".ttf")
            || uri.endsWith(".woff")
            || uri.endsWith(".md")
            || uri.startsWith("/actuator"));
    }

    @Override
    public void init(FilterConfig filterConfig) {
        // nothing to do
    }

    @Override
    public void destroy() {
        // nothing to do
    }
}
