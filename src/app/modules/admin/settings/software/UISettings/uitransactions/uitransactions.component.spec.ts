import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UITransactionsComponent } from './uitransactions.component';

describe('UITransactionsComponent', () => {
  let component: UITransactionsComponent;
  let fixture: ComponentFixture<UITransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UITransactionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UITransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
