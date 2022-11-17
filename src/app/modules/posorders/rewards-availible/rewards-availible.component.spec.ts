import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardsAvailibleComponent } from './rewards-availible.component';

describe('RewardsAvailibleComponent', () => {
  let component: RewardsAvailibleComponent;
  let fixture: ComponentFixture<RewardsAvailibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RewardsAvailibleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RewardsAvailibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
