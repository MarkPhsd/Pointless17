import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditButtonsStandardComponent } from './edit-buttons-standard.component';

describe('EditButtonsStandardComponent', () => {
  let component: EditButtonsStandardComponent;
  let fixture: ComponentFixture<EditButtonsStandardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditButtonsStandardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditButtonsStandardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
