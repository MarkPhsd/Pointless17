import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayMenuSortComponent } from './display-menu-sort.component';

describe('DisplayMenuSortComponent', () => {
  let component: DisplayMenuSortComponent;
  let fixture: ComponentFixture<DisplayMenuSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayMenuSortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayMenuSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
