import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftCardProductEditComponent } from './gift-card-product-edit.component';

describe('GiftCardProductEditComponent', () => {
  let component: GiftCardProductEditComponent;
  let fixture: ComponentFixture<GiftCardProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GiftCardProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GiftCardProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
