import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuItemGalleryComponent } from './menu-item-gallery.component';

describe('MenuItemGalleryComponent', () => {
  let component: MenuItemGalleryComponent;
  let fixture: ComponentFixture<MenuItemGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuItemGalleryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuItemGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
