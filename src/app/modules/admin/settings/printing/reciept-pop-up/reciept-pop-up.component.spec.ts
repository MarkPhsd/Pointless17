import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecieptPopUpComponent } from './reciept-pop-up.component';

describe('RecieptPopUpComponent', () => {
  let component: RecieptPopUpComponent;
  let fixture: ComponentFixture<RecieptPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecieptPopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecieptPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
