import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagChipsProductsComponent } from './tag-chips-products.component';

describe('TagChipsProductsComponent', () => {
  let component: TagChipsProductsComponent;
  let fixture: ComponentFixture<TagChipsProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagChipsProductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagChipsProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
