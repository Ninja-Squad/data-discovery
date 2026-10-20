import {
  OntologyDetails,
  OntologyNodeType,
  TraitClassDetails,
  TraitDetails,
  VariableDetails
} from '../ontology.service';

interface BaseTypedNodeDetails {
  type: OntologyNodeType;
  details: OntologyDetails | TraitClassDetails | TraitDetails | VariableDetails;
}

interface TypedOntologyDetails extends BaseTypedNodeDetails {
  type: 'ONTOLOGY';
  details: OntologyDetails;
}

interface TypedTraitClassDetails extends BaseTypedNodeDetails {
  type: 'TRAIT_CLASS';
  details: TraitClassDetails;
}

interface TypedTraitDetails extends BaseTypedNodeDetails {
  type: 'TRAIT';
  details: TraitDetails;
}

interface TypedVariableDetails extends BaseTypedNodeDetails {
  type: 'VARIABLE';
  details: VariableDetails;
}

export type TypedNodeDetails =
  | TypedOntologyDetails
  | TypedTraitClassDetails
  | TypedTraitDetails
  | TypedVariableDetails;
