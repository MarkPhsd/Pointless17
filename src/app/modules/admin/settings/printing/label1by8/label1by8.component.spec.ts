import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Label1by8Component } from './label1by8.component';

describe('Label1by8Component', () => {
  let component: Label1by8Component;
  let fixture: ComponentFixture<Label1by8Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Label1by8Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Label1by8Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
