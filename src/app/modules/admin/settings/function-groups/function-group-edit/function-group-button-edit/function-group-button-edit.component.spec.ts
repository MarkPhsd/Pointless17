import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionGroupButtonEditComponent } from './function-group-button-edit.component';

describe('FunctionGroupButtonEditComponent', () => {
  let component: FunctionGroupButtonEditComponent;
  let fixture: ComponentFixture<FunctionGroupButtonEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FunctionGroupButtonEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionGroupButtonEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
