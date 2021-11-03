import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueFieldsComponent } from './value-fields.component';

describe('ValueFieldsComponent', () => {
  let component: ValueFieldsComponent;
  let fixture: ComponentFixture<ValueFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValueFieldsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
