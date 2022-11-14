import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayMenuSelctorComponent } from './display-menu-selctor.component';

describe('DisplayMenuSelctorComponent', () => {
  let component: DisplayMenuSelctorComponent;
  let fixture: ComponentFixture<DisplayMenuSelctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayMenuSelctorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayMenuSelctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
