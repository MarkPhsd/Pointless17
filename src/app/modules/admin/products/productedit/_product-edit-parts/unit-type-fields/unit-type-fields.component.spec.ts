import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitTypeFieldsComponent } from './unit-type-fields.component';

describe('UnitTypeFieldsComponent', () => {
  let component: UnitTypeFieldsComponent;
  let fixture: ComponentFixture<UnitTypeFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitTypeFieldsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitTypeFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
