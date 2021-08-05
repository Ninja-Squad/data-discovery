import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyAggregationModalComponent } from './ontology-aggregation-modal.component';

describe('OntologyAggregationModalComponent', () => {
  let component: OntologyAggregationModalComponent;
  let fixture: ComponentFixture<OntologyAggregationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OntologyAggregationModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyAggregationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
