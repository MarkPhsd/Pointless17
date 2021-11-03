import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubMenuItemEditComponent } from './sub-menu-item-edit.component';

describe('SubMenuItemEditComponent', () => {
  let component: SubMenuItemEditComponent;
  let fixture: ComponentFixture<SubMenuItemEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubMenuItemEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubMenuItemEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
