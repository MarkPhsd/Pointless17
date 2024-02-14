import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseFloatingButtonComponent } from './close-floating-button.component';

describe('CloseFloatingButtonComponent', () => {
  let component: CloseFloatingButtonComponent;
  let fixture: ComponentFixture<CloseFloatingButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseFloatingButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloseFloatingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
