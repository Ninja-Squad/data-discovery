package fr.inra.urgi.datadiscovery.doc;

import org.springframework.boot.test.autoconfigure.restdocs.RestDocsMockMvcConfigurationCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.http.HttpHeaders;
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentationConfigurer;

import static org.springframework.restdocs.operation.preprocess.Preprocessors.prettyPrint;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.removeHeaders;

/**
 * Additional configuration class allowing to set defaults regarding the REST documentation
 * @author JB Nizet
 */
@TestConfiguration
public class DocumentationConfig implements RestDocsMockMvcConfigurationCustomizer {
    @Override
    public void customize(MockMvcRestDocumentationConfigurer configurer) {
        configurer.operationPreprocessors()
                  .withRequestDefaults(prettyPrint())
                  .withResponseDefaults(prettyPrint(), removeHeaders(HttpHeaders.CONTENT_TYPE,
                                                                     HttpHeaders.CONTENT_LENGTH));
    }
}
