import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvHappyHoursComponent } from './tv-happy-hours.component';

describe('TvHappyHoursComponent', () => {
  let component: TvHappyHoursComponent;
  let fixture: ComponentFixture<TvHappyHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TvHappyHoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TvHappyHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
