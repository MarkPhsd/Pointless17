import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewInventoryItemComponent } from './new-inventory-item.component';

describe('NewInventoryItemComponent', () => {
  let component: NewInventoryItemComponent;
  let fixture: ComponentFixture<NewInventoryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewInventoryItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewInventoryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
