import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrainIndicatorComponent } from './strain-indicator.component';

describe('StrainIndicatorComponent', () => {
  let component: StrainIndicatorComponent;
  let fixture: ComponentFixture<StrainIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrainIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrainIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
