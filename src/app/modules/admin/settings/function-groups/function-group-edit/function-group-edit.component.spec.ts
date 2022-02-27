import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionGroupEditComponent } from './function-group-edit.component';

describe('FunctionGroupEditComponent', () => {
  let component: FunctionGroupEditComponent;
  let fixture: ComponentFixture<FunctionGroupEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FunctionGroupEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionGroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
