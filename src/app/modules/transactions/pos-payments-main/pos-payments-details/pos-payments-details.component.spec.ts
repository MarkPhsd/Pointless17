import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosPaymentsDetailsComponent } from './pos-payments-details.component';

describe('PosPaymentsDetailsComponent', () => {
  let component: PosPaymentsDetailsComponent;
  let fixture: ComponentFixture<PosPaymentsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosPaymentsDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosPaymentsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
