import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POSPaymentsComponent } from './pospayments.component';

describe('POSPaymentsComponent', () => {
  let component: POSPaymentsComponent;
  let fixture: ComponentFixture<POSPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ POSPaymentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(POSPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
