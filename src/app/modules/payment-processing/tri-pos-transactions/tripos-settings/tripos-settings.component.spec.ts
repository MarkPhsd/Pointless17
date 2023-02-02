import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriposSettingsComponent } from './tripos-settings.component';

describe('TriposSettingsComponent', () => {
  let component: TriposSettingsComponent;
  let fixture: ComponentFixture<TriposSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TriposSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TriposSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
