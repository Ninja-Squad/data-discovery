package fr.inra.urgi.datadiscovery.pillar;

import java.util.List;

import fr.inra.urgi.datadiscovery.dao.DocumentDao;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller used to get the information, displayed in the home page, about pillars.
 * @author JB Nizet
 */
@RestController
@RequestMapping("/api/pillars")
public class PillarController {

    private final DocumentDao<?> documentDao;

    public PillarController(DocumentDao<?> documentDao) {
        this.documentDao = documentDao;
    }

    @GetMapping
    public List<PillarDTO> list() {
        return documentDao.findPillars();
    }
}
