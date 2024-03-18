import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayAPIIFrameComponent } from './pay-apiiframe.component';

describe('PayAPIIFrameComponent', () => {
  let component: PayAPIIFrameComponent;
  let fixture: ComponentFixture<PayAPIIFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayAPIIFrameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayAPIIFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
