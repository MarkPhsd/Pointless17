import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatSelectNGModelComponent } from './mat-select-ngmodel.component';

describe('MatSelectNGModelComponent', () => {
  let component: MatSelectNGModelComponent;
  let fixture: ComponentFixture<MatSelectNGModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatSelectNGModelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatSelectNGModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
