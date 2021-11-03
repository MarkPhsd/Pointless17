import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridImageFormatterComponent } from './ag-grid-image-formatter.component';

describe('AgGridImageFormatterComponent', () => {
  let component: AgGridImageFormatterComponent;
  let fixture: ComponentFixture<AgGridImageFormatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgGridImageFormatterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgGridImageFormatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
