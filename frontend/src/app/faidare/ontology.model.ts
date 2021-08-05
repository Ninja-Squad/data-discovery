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

export interface TypedOntologyDetails extends BaseTypedNodeDetails {
  type: 'ONTOLOGY';
  details: OntologyDetails;
}

export interface TypedTraitClassDetails extends BaseTypedNodeDetails {
  type: 'TRAIT_CLASS';
  details: TraitClassDetails;
}

export interface TypedTraitDetails extends BaseTypedNodeDetails {
  type: 'TRAIT';
  details: TraitDetails;
}

export interface TypedVariableDetails extends BaseTypedNodeDetails {
  type: 'VARIABLE';
  details: VariableDetails;
}

export type TypedNodeDetails =
  | TypedOntologyDetails
  | TypedTraitClassDetails
  | TypedTraitDetails
  | TypedVariableDetails;
