package fr.inra.urgi.datadiscovery.ontology;

import java.util.List;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNode;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The REST controller exposing an endpoint used to display the ontology tree and get the details of a highlighted tree node
 *
 * @author JB Nizet
 */
@RestController
@RequestMapping("/api/ontologies")
@Profile({AppProfile.FAIDARE})
public class OntologyController {

    private final OntologyService ontologyService;

    public OntologyController(OntologyService ontologyService) {
        this.ontologyService = ontologyService;
    }

    @GetMapping
    public List<TreeNode> getTree() {
        return this.ontologyService.getTree();
    }
}
