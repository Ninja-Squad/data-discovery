package fr.inra.urgi.rare.search;

import java.util.List;

import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.dao.rare.RareGeneticResourceDao;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * A REST controller for the suggestion API
 */
@RestController
@RequestMapping("/api/genetic-resources-suggestions")
public class SuggestionController {

    private GeneticResourceDao<?, ?> geneticResourceDao;

    public SuggestionController(RareGeneticResourceDao geneticResourceDao) {
        this.geneticResourceDao = geneticResourceDao;
    }

    @GetMapping
    public List<String> suggest(@RequestParam("query") String query) {
        return geneticResourceDao.suggest(query);
    }
}
