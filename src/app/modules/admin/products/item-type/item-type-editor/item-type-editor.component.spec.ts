import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemTypeEditorComponent } from './item-type-editor.component';

describe('ItemTypeEditorComponent', () => {
  let component: ItemTypeEditorComponent;
  let fixture: ComponentFixture<ItemTypeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemTypeEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemTypeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
