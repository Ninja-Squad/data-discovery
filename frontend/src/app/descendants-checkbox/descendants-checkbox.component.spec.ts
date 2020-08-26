import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescendantsCheckboxComponent } from './descendants-checkbox.component';
import { TranslateModule } from '@ngx-translate/core';

describe('DescendantsCheckboxComponent', () => {
  let component: DescendantsCheckboxComponent;
  let fixture: ComponentFixture<DescendantsCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DescendantsCheckboxComponent ],
      imports: [TranslateModule.forRoot()]
    })
    .compileComponents();
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
