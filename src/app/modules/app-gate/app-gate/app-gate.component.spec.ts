import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppGateComponent } from './app-gate.component';

describe('AppGateComponent', () => {
  let component: AppGateComponent;
  let fixture: ComponentFixture<AppGateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppGateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppGateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
