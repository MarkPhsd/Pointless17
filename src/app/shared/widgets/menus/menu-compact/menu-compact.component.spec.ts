import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuCompactComponent } from './menu-compact.component';

describe('MenuCompactComponent', () => {
  let component: MenuCompactComponent;
  let fixture: ComponentFixture<MenuCompactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuCompactComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuCompactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
