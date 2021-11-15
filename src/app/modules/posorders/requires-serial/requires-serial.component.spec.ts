import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequiresSerialComponent } from './requires-serial.component';

describe('RequiresSerialComponent', () => {
  let component: RequiresSerialComponent;
  let fixture: ComponentFixture<RequiresSerialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequiresSerialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequiresSerialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
