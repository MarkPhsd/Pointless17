import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuySellMainComponent } from './buy-sell-main.component';

describe('BuySellMainComponent', () => {
  let component: BuySellMainComponent;
  let fixture: ComponentFixture<BuySellMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuySellMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuySellMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
