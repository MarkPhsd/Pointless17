import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferOrderComponent } from './transfer-order.component';

describe('TransferOrderComponent', () => {
  let component: TransferOrderComponent;
  let fixture: ComponentFixture<TransferOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
