package fr.inra.urgi.rare;

import fr.inra.urgi.rare.config.RareProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * The main Rare Application
 * @author JB Nizet
 */
@SpringBootApplication
@EnableAsync
@EnableConfigurationProperties(RareProperties.class)
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
