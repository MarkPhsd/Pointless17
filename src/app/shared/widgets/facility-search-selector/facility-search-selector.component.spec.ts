import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitySearchSelectorComponent } from './facility-search-selector.component';

describe('FacilitySearchSelectorComponent', () => {
  let component: FacilitySearchSelectorComponent;
  let fixture: ComponentFixture<FacilitySearchSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacilitySearchSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilitySearchSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
