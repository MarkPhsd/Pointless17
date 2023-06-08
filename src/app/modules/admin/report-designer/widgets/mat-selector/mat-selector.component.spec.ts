import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatSelectorComponent } from './mat-selector.component';

describe('MatSelectorComponent', () => {
  let component: MatSelectorComponent;
  let fixture: ComponentFixture<MatSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
