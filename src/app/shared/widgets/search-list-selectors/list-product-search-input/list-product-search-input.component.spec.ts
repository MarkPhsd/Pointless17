import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListProductSearchInputComponent } from './list-product-search-input.component';

describe('ListProductSearchInputComponent', () => {
  let component: ListProductSearchInputComponent;
  let fixture: ComponentFixture<ListProductSearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListProductSearchInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListProductSearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
