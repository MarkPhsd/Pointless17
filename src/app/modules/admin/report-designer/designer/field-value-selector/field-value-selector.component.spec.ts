import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldValueSelectorComponent } from './field-value-selector.component';

describe('FieldValueSelectorComponent', () => {
  let component: FieldValueSelectorComponent;
  let fixture: ComponentFixture<FieldValueSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldValueSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldValueSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
