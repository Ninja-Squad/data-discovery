package fr.inra.urgi.datadiscovery;

import fr.inra.urgi.datadiscovery.config.DataDiscoveryProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * The main data-discovery Application
 * @author JB Nizet
 */
@SpringBootApplication
@EnableAsync
@EnableConfigurationProperties(DataDiscoveryProperties.class)
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
