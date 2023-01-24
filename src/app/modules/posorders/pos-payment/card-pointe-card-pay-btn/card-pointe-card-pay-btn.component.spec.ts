import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPointeCardPayBtnComponent } from './card-pointe-card-pay-btn.component';

describe('CardPointeCardPayBtnComponent', () => {
  let component: CardPointeCardPayBtnComponent;
  let fixture: ComponentFixture<CardPointeCardPayBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardPointeCardPayBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardPointeCardPayBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
