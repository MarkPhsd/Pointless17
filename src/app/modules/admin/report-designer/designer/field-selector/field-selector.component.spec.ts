import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldSelectorComponent } from './field-selector.component';

describe('FieldSelectorComponent', () => {
  let component: FieldSelectorComponent;
  let fixture: ComponentFixture<FieldSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
