import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemTypeDisplayAssignmentComponent } from './item-type-display-assignment.component';

describe('ItemTypeDisplayAssignmentComponent', () => {
  let component: ItemTypeDisplayAssignmentComponent;
  let fixture: ComponentFixture<ItemTypeDisplayAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemTypeDisplayAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemTypeDisplayAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
