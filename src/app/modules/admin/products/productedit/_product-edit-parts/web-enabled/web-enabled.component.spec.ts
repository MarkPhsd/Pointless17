import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebEnabledComponent } from './web-enabled.component';

describe('WebEnabledComponent', () => {
  let component: WebEnabledComponent;
  let fixture: ComponentFixture<WebEnabledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebEnabledComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebEnabledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
