import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSelectListComponent } from './form-select-list.component';

describe('FormSelectListComponent', () => {
  let component: FormSelectListComponent;
  let fixture: ComponentFixture<FormSelectListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormSelectListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSelectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
