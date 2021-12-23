import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledMenuListComponent } from './scheduled-menu-list.component';

describe('ScheduledMenuListComponent', () => {
  let component: ScheduledMenuListComponent;
  let fixture: ComponentFixture<ScheduledMenuListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduledMenuListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledMenuListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
