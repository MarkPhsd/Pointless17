import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuTinyComponent } from './menu-tiny.component';

describe('MenuTinyComponent', () => {
  let component: MenuTinyComponent;
  let fixture: ComponentFixture<MenuTinyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuTinyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuTinyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
