import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescendantsCheckboxComponent } from './descendants-checkbox.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataDiscoveryNgbTestingModule } from '../data-discovery-ngb-testing.module';

describe('DescendantsCheckboxComponent', () => {
  let component: DescendantsCheckboxComponent;
  let fixture: ComponentFixture<DescendantsCheckboxComponent>;

  beforeEach(() => TestBed.configureTestingModule({
    declarations: [DescendantsCheckboxComponent],
    imports: [DataDiscoveryNgbTestingModule, TranslateModule.forRoot()]
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DescendantsCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
