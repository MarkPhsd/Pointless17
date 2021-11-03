import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APISettingComponent } from './apisetting.component';

describe('APISettingComponent', () => {
  let component: APISettingComponent;
  let fixture: ComponentFixture<APISettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ APISettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(APISettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
