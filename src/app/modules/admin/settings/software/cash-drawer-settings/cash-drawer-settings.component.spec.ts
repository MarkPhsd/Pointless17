import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashDrawerSettingsComponent } from './cash-drawer-settings.component';

describe('CashDrawerSettingsComponent', () => {
  let component: CashDrawerSettingsComponent;
  let fixture: ComponentFixture<CashDrawerSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashDrawerSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashDrawerSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
