import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitTypeSelectComponent } from './unit-type-select.component';

describe('UnitTypeSelectComponent', () => {
  let component: UnitTypeSelectComponent;
  let fixture: ComponentFixture<UnitTypeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitTypeSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitTypeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
