import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileRolesComponent } from './profile-roles.component';

describe('ProfileRolesComponent', () => {
  let component: ProfileRolesComponent;
  let fixture: ComponentFixture<ProfileRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileRolesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
