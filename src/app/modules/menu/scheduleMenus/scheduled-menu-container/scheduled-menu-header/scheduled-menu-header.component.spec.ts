import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledMenuHeaderComponent } from './scheduled-menu-header.component';

describe('ScheduledMenuHeaderComponent', () => {
  let component: ScheduledMenuHeaderComponent;
  let fixture: ComponentFixture<ScheduledMenuHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduledMenuHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledMenuHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
