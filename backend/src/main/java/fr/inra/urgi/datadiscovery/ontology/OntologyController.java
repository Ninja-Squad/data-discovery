package fr.inra.urgi.datadiscovery.ontology;

import java.util.List;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.exception.NotFoundException;
import fr.inra.urgi.datadiscovery.ontology.state.OntologyDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TraitClassDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TraitDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNode;
import fr.inra.urgi.datadiscovery.ontology.state.VariableDetails;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping("/{ontologyId}")
    public OntologyDetails getOntology(@PathVariable("ontologyId") String ontologyId) {
        return this.ontologyService.getOntology(ontologyId).orElseThrow(NotFoundException::new);
    }

    @GetMapping("/trait-classes/{traitClassId}")
    public TraitClassDetails getTraitClass(@PathVariable("traitClassId") String traitClassId) {
        return this.ontologyService.getTraitClass(traitClassId).orElseThrow(NotFoundException::new);
    }

    @GetMapping("/traits/{traitId}")
    public TraitDetails getTrait(@PathVariable("traitId") String traitId) {
        return this.ontologyService.getTrait(traitId).orElseThrow(NotFoundException::new);
    }

    @GetMapping("/variables/{variableId}")
    public VariableDetails getVariable(@PathVariable("variableId") String variableId) {
        return this.ontologyService.getVariable(variableId).orElseThrow(NotFoundException::new);
    }
}
