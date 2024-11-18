import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintTemplatePopUpComponent } from './print-template-pop-up.component';

describe('PrintTemplatePopUpComponent', () => {
  let component: PrintTemplatePopUpComponent;
  let fixture: ComponentFixture<PrintTemplatePopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintTemplatePopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintTemplatePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
