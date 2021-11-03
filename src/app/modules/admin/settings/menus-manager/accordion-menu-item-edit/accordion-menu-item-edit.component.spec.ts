import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionMenuItemEditComponent } from './accordion-menu-item-edit.component';

describe('AccordionMenuItemEditComponent', () => {
  let component: AccordionMenuItemEditComponent;
  let fixture: ComponentFixture<AccordionMenuItemEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccordionMenuItemEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionMenuItemEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
