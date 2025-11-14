import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'dd-ontology',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class GenericOntologyComponent {}

export const OntologyComponent = GenericOntologyComponent;
