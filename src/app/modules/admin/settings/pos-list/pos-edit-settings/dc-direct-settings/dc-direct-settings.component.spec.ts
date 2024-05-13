import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DcDirectSettingsComponent } from './dc-direct-settings.component';

describe('DcDirectSettingsComponent', () => {
  let component: DcDirectSettingsComponent;
  let fixture: ComponentFixture<DcDirectSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DcDirectSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DcDirectSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
