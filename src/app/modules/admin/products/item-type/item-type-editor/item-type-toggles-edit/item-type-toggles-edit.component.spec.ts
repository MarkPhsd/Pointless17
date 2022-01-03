import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemTypeTogglesEditComponent } from './item-type-toggles-edit.component';

describe('ItemTypeTogglesEditComponent', () => {
  let component: ItemTypeTogglesEditComponent;
  let fixture: ComponentFixture<ItemTypeTogglesEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemTypeTogglesEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemTypeTogglesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
