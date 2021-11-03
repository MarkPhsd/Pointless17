import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSalesCardComponent } from './item-sales-card.component';

describe('ItemSalesCardComponent', () => {
  let component: ItemSalesCardComponent;
  let fixture: ComponentFixture<ItemSalesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemSalesCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSalesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
