import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusLookupComponent } from './status-lookup.component';

describe('StatusLookupComponent', () => {
  let component: StatusLookupComponent;
  let fixture: ComponentFixture<StatusLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatusLookupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
