import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickPayButtonsComponent } from './quick-pay-buttons.component';

describe('QuickPayButtonsComponent', () => {
  let component: QuickPayButtonsComponent;
  let fixture: ComponentFixture<QuickPayButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickPayButtonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickPayButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
