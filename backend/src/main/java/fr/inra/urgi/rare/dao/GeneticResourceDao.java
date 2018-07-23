package fr.inra.urgi.rare.dao;

import fr.inra.urgi.rare.domain.GeneticResource;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface GeneticResourceDao extends ElasticsearchRepository<GeneticResource, String> {
}
