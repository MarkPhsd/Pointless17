import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardpointeTransactionsComponent } from './cardpointe-transactions.component';

describe('CardpointeTransactionsComponent', () => {
  let component: CardpointeTransactionsComponent;
  let fixture: ComponentFixture<CardpointeTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardpointeTransactionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardpointeTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
