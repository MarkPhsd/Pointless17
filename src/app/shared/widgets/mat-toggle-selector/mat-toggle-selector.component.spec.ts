import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatToggleSelectorComponent } from './mat-toggle-selector.component';

describe('MatToggleSelectorComponent', () => {
  let component: MatToggleSelectorComponent;
  let fixture: ComponentFixture<MatToggleSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatToggleSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatToggleSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
