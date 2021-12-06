import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDateRangeComponent } from './mat-date-range.component';

describe('MatDateRangeComponent', () => {
  let component: MatDateRangeComponent;
  let fixture: ComponentFixture<MatDateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatDateRangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
