import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionButtonsListComponent } from './function-buttons-list.component';

describe('FunctionButtonsListComponent', () => {
  let component: FunctionButtonsListComponent;
  let fixture: ComponentFixture<FunctionButtonsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FunctionButtonsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FunctionButtonsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
