package fr.inra.urgi.datadiscovery.doc;

import static org.springframework.restdocs.operation.preprocess.Preprocessors.prettyPrint;

import org.springframework.boot.restdocs.test.autoconfigure.RestDocsMockMvcConfigurationCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.http.HttpHeaders;
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentationConfigurer;
import org.springframework.restdocs.operation.preprocess.HeadersModifyingOperationPreprocessor;

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
                  .withResponseDefaults(
                      prettyPrint(),
                      new HeadersModifyingOperationPreprocessor()
                          .remove(HttpHeaders.CONTENT_TYPE)
                          .remove(HttpHeaders.CONTENT_LENGTH)
                  );
    }
}
