import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridTestComponent } from './ag-grid-test.component';

describe('AgGridTestComponent', () => {
  let component: AgGridTestComponent;
  let fixture: ComponentFixture<AgGridTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgGridTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgGridTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
