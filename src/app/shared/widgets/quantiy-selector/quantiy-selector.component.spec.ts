import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantiySelectorComponent } from './quantiy-selector.component';

describe('QuantiySelectorComponent', () => {
  let component: QuantiySelectorComponent;
  let fixture: ComponentFixture<QuantiySelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuantiySelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuantiySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
