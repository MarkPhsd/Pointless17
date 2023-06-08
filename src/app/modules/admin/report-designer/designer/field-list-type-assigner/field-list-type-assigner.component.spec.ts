import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldListTypeAssignerComponent } from './field-list-type-assigner.component';

describe('FieldListTypeAssignerComponent', () => {
  let component: FieldListTypeAssignerComponent;
  let fixture: ComponentFixture<FieldListTypeAssignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldListTypeAssignerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldListTypeAssignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
