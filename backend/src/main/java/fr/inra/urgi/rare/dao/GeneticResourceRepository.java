package fr.inra.urgi.rare.dao;

import fr.inra.urgi.rare.domain.GeneticResource;
import org.springframework.stereotype.Component;

/**
 * Repository for genetic resources
 * @author JB Nizet
 */
@Component
public class GeneticResourceRepository {
    public void save(GeneticResource geneticResource) {
        // TODO really store
        System.out.println("geneticResource = " + geneticResource);
    }
}
