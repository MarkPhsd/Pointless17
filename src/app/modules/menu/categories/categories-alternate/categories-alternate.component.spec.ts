import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesAlternateComponent } from './categories-alternate.component';

describe('CategoriesAlternateComponent', () => {
  let component: CategoriesAlternateComponent;
  let fixture: ComponentFixture<CategoriesAlternateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoriesAlternateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriesAlternateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
