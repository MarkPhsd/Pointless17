import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemTypeSortComponent } from './item-type-sort.component';

describe('ItemTypeSortComponent', () => {
  let component: ItemTypeSortComponent;
  let fixture: ComponentFixture<ItemTypeSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemTypeSortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemTypeSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
