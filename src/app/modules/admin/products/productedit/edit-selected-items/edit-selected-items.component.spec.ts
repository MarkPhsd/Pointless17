import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSelectedItemsComponent } from './edit-selected-items.component';

describe('EditSelectedItemsComponent', () => {
  let component: EditSelectedItemsComponent;
  let fixture: ComponentFixture<EditSelectedItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSelectedItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSelectedItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
