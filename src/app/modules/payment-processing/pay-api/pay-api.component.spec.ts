import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayAPIComponent } from './pay-api.component';

describe('PayAPIComponent', () => {
  let component: PayAPIComponent;
  let fixture: ComponentFixture<PayAPIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayAPIComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayAPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
