import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileIDCardInfoComponent } from './profile-idcard-info.component';

describe('ProfileIDCardInfoComponent', () => {
  let component: ProfileIDCardInfoComponent;
  let fixture: ComponentFixture<ProfileIDCardInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileIDCardInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileIDCardInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
