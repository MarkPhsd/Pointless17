import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledMenuItemsComponent } from './scheduled-menu-items.component';

describe('ScheduledMenuItemsComponent', () => {
  let component: ScheduledMenuItemsComponent;
  let fixture: ComponentFixture<ScheduledMenuItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduledMenuItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledMenuItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
