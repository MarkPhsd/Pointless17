import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosCheckOutButtonsComponent } from './pos-check-out-buttons.component';

describe('PosCheckOutButtonsComponent', () => {
  let component: PosCheckOutButtonsComponent;
  let fixture: ComponentFixture<PosCheckOutButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosCheckOutButtonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosCheckOutButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
