import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledMenuItemComponent } from './scheduled-menu-item.component';

describe('ScheduledMenuItemComponent', () => {
  let component: ScheduledMenuItemComponent;
  let fixture: ComponentFixture<ScheduledMenuItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduledMenuItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledMenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
