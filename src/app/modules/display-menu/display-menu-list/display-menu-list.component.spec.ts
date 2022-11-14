import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayMenuListComponent } from './display-menu-list.component';

describe('DisplayMenuListComponent', () => {
  let component: DisplayMenuListComponent;
  let fixture: ComponentFixture<DisplayMenuListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayMenuListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayMenuListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
