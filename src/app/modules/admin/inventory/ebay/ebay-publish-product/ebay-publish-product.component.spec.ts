import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EbayPublishProductComponent } from './ebay-publish-product.component';

describe('EbayPublishProductComponent', () => {
  let component: EbayPublishProductComponent;
  let fixture: ComponentFixture<EbayPublishProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EbayPublishProductComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EbayPublishProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
