import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitTypePromptComponent } from './unit-type-prompt.component';

describe('UnitTypePromptComponent', () => {
  let component: UnitTypePromptComponent;
  let fixture: ComponentFixture<UnitTypePromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitTypePromptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitTypePromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
