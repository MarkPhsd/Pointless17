import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileMedInfoComponent } from './profile-med-info.component';

describe('ProfileMedInfoComponent', () => {
  let component: ProfileMedInfoComponent;
  let fixture: ComponentFixture<ProfileMedInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileMedInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileMedInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
