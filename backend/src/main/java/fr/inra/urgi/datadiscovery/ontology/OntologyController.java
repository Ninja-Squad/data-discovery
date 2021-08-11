package fr.inra.urgi.datadiscovery.ontology;

import static fr.inra.urgi.datadiscovery.ontology.OntologyService.DEFAULT_LANGUAGE;

import java.util.List;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.exception.NotFoundException;
import fr.inra.urgi.datadiscovery.ontology.state.OntologyDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TraitClassDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TraitDetails;
import fr.inra.urgi.datadiscovery.ontology.state.TreeI18n;
import fr.inra.urgi.datadiscovery.ontology.state.TreeNode;
import fr.inra.urgi.datadiscovery.ontology.state.VariableDetails;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/i18n")
    public TreeI18n getTreeI18n(@RequestParam(value = "language", defaultValue = DEFAULT_LANGUAGE) String language) {
        return this.ontologyService.getTreeI18n(language);
    }

    @GetMapping("/{ontologyId}")
    public OntologyDetails getOntology(@PathVariable("ontologyId") String ontologyId,
                                       @RequestParam(value = "language", defaultValue = DEFAULT_LANGUAGE) String language) {
        return this.ontologyService.getOntology(ontologyId, language).orElseThrow(NotFoundException::new);
    }

    @GetMapping("/trait-classes/{traitClassId}")
    public TraitClassDetails getTraitClass(@PathVariable("traitClassId") String traitClassId,
                                           @RequestParam(value = "language", defaultValue = DEFAULT_LANGUAGE) String language) {
        return this.ontologyService.getTraitClass(traitClassId, language).orElseThrow(NotFoundException::new);
    }

    @GetMapping("/traits/{traitId}")
    public TraitDetails getTrait(@PathVariable("traitId") String traitId,
                                 @RequestParam(value = "language", defaultValue = DEFAULT_LANGUAGE) String language) {
        return this.ontologyService.getTrait(traitId, language).orElseThrow(NotFoundException::new);
    }

    @GetMapping("/variables/{variableId}")
    public VariableDetails getVariable(@PathVariable("variableId") String variableId,
                                       @RequestParam(value = "language", defaultValue = DEFAULT_LANGUAGE) String language) {
        return this.ontologyService.getVariable(variableId, language).orElseThrow(NotFoundException::new);
    }
}
