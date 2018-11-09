package fr.inra.urgi.datadiscovery.search;

import java.util.List;

import fr.inra.urgi.datadiscovery.dao.DocumentDao;
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

    private DocumentDao<?, ?> documentDao;

    public SuggestionController(DocumentDao<?, ?> documentDao) {
        this.documentDao = documentDao;
    }

    @GetMapping
    public List<String> suggest(@RequestParam("query") String query) {
        return documentDao.suggest(query);
    }
}
