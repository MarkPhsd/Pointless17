import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatMenuBasicComponent } from './mat-menu-basic.component';

describe('MatMenuBasicComponent', () => {
  let component: MatMenuBasicComponent;
  let fixture: ComponentFixture<MatMenuBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatMenuBasicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatMenuBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
