package fr.inra.urgi.datadiscovery.doc;

import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post;

/**
 * Utility class fr documentation tests
 * @author JB Nizet
 */
public class DocUtils {
    private static final String CONTEXT_PATH = "/rare";

    /**
     * Prepends the <code>/rare</code> context path to the given path, and specifies it as the context path
     * of the created GET mock request builder. This is used by doc tests in order to show realistic URLs
     * in the documentation
     */
    public static MockHttpServletRequestBuilder docGet(String path, Object... urlVariables) {
        return get(CONTEXT_PATH + path, urlVariables).contextPath(CONTEXT_PATH);
    }

    /**
     * Prepends the <code>/rare</code> context path to the given path, and specifies it as the context path
     * of the created POST mock request builder. This is used by doc tests in order to show realistic URLs
     * in the documentation
     */
    public static MockHttpServletRequestBuilder docPost(String path, Object... urlVariables) {
        return post(CONTEXT_PATH + path, urlVariables).contextPath(CONTEXT_PATH);
    }
}
