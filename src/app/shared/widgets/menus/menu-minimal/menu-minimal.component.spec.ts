import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuMinimalComponent } from './menu-minimal.component';

describe('MenuMinimalComponent', () => {
  let component: MenuMinimalComponent;
  let fixture: ComponentFixture<MenuMinimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuMinimalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuMinimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
