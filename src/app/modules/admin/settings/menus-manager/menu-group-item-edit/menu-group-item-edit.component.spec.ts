import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuGroupItemEditComponent } from './menu-group-item-edit.component';

describe('MenuGroupItemEditComponent', () => {
  let component: MenuGroupItemEditComponent;
  let fixture: ComponentFixture<MenuGroupItemEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuGroupItemEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuGroupItemEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
