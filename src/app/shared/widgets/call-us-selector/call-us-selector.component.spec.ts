import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallUsSelectorComponent } from './call-us-selector.component';

describe('CallUsSelectorComponent', () => {
  let component: CallUsSelectorComponent;
  let fixture: ComponentFixture<CallUsSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallUsSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallUsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
