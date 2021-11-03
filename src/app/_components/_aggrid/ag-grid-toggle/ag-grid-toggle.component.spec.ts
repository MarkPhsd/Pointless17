import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridToggleComponent } from './ag-grid-toggle.component';

describe('AgGridToggleComponent', () => {
  let component: AgGridToggleComponent;
  let fixture: ComponentFixture<AgGridToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgGridToggleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgGridToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
