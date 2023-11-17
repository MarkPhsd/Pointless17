import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitTypeSelectorComponent } from './unit-type-selector.component';

describe('UnitTypeSelectorComponent', () => {
  let component: UnitTypeSelectorComponent;
  let fixture: ComponentFixture<UnitTypeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitTypeSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitTypeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
