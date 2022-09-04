import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPointSettingsComponent } from './card-point-settings.component';

describe('CardPointSettingsComponent', () => {
  let component: CardPointSettingsComponent;
  let fixture: ComponentFixture<CardPointSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardPointSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPointSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
