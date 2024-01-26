import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPreferencesComponent } from './user-preferences.component';

describe('UserPreferencesComponent', () => {
  let component: UserPreferencesComponent;
  let fixture: ComponentFixture<UserPreferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserPreferencesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
