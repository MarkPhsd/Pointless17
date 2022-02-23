import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMenuProductsComponent } from './search-menu-products.component';

describe('SearchMenuProductsComponent', () => {
  let component: SearchMenuProductsComponent;
  let fixture: ComponentFixture<SearchMenuProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchMenuProductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchMenuProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
