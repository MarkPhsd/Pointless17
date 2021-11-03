import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCSSStylesComponent } from './edit-cssstyles.component';

describe('EditCSSStylesComponent', () => {
  let component: EditCSSStylesComponent;
  let fixture: ComponentFixture<EditCSSStylesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCSSStylesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCSSStylesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
