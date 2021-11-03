import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitTypeEditComponent } from './unit-type-edit.component';

describe('UnitTypeEditComponent', () => {
  let component: UnitTypeEditComponent;
  let fixture: ComponentFixture<UnitTypeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitTypeEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitTypeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
