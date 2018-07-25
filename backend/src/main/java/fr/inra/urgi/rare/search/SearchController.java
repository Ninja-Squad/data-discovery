package fr.inra.urgi.rare.search;

import java.util.Optional;

import fr.inra.urgi.rare.dao.GeneticResourceDao;
import fr.inra.urgi.rare.domain.GeneticResource;
import fr.inra.urgi.rare.dto.PageDTO;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * A REST controller for the search API
 */
@RestController
@RequestMapping("/api/genetic-resources")
public class SearchController {

    public static final int PAGE_SIZE = 20;

    private GeneticResourceDao geneticResourceDao;

    public SearchController(GeneticResourceDao geneticResourceDao) {
        this.geneticResourceDao = geneticResourceDao;
    }

    @GetMapping
    public PageDTO<GeneticResource> search(@RequestParam("query") String query, Optional<Integer> page) {
        return PageDTO.fromPage(geneticResourceDao.search(query, PageRequest.of(page.orElse(0), PAGE_SIZE)));
    }
}
