import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyNodeTypeComponent } from './ontology-node-type.component';

describe('OntologyNodeTypeComponent', () => {
  let component: OntologyNodeTypeComponent;
  let fixture: ComponentFixture<OntologyNodeTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OntologyNodeTypeComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyNodeTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
