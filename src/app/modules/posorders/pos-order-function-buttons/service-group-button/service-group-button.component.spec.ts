import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceGroupButtonComponent } from './service-group-button.component';

describe('ServiceGroupButtonComponent', () => {
  let component: ServiceGroupButtonComponent;
  let fixture: ComponentFixture<ServiceGroupButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceGroupButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceGroupButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
