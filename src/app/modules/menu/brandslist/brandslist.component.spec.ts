import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandslistComponent } from './brandslist.component';

describe('BrandslistComponent', () => {
  let component: BrandslistComponent;
  let fixture: ComponentFixture<BrandslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandslistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
