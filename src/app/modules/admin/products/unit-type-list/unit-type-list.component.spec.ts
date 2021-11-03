import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitTypeListComponent } from './unit-type-list.component';

describe('UnitTypeListComponent', () => {
  let component: UnitTypeListComponent;
  let fixture: ComponentFixture<UnitTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitTypeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
