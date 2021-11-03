import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HTMLEditPrintingComponent } from './htmledit-printing.component';

describe('HTMLEditPrintingComponent', () => {
  let component: HTMLEditPrintingComponent;
  let fixture: ComponentFixture<HTMLEditPrintingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HTMLEditPrintingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HTMLEditPrintingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
