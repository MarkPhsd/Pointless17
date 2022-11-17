import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayMenuTitleComponent } from './display-menu-title.component';

describe('DisplayMenuTitleComponent', () => {
  let component: DisplayMenuTitleComponent;
  let fixture: ComponentFixture<DisplayMenuTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayMenuTitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayMenuTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
