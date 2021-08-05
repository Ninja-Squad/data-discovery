import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaidareOntologyAggregationComponent } from './faidare-ontology-aggregation.component';

describe('FaidareOntologyAggregationComponent', () => {
  let component: FaidareOntologyAggregationComponent;
  let fixture: ComponentFixture<FaidareOntologyAggregationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaidareOntologyAggregationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaidareOntologyAggregationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
