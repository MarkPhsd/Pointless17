import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriPosTransactionsComponent } from './tri-pos-transactions.component';

describe('TriPosTransactionsComponent', () => {
  let component: TriPosTransactionsComponent;
  let fixture: ComponentFixture<TriPosTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TriPosTransactionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TriPosTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
