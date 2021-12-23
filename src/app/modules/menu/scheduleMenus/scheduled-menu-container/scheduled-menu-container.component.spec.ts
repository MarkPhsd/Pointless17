import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledMenuContainerComponent } from './scheduled-menu-container.component';

describe('ScheduledMenuContainerComponent', () => {
  let component: ScheduledMenuContainerComponent;
  let fixture: ComponentFixture<ScheduledMenuContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduledMenuContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledMenuContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
