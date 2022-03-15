import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledMenuImageComponent } from './scheduled-menu-image.component';

describe('ScheduledMenuImageComponent', () => {
  let component: ScheduledMenuImageComponent;
  let fixture: ComponentFixture<ScheduledMenuImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduledMenuImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledMenuImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
