import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTypeListComponent } from './service-type-list.component';

describe('ServiceTypeListComponent', () => {
  let component: ServiceTypeListComponent;
  let fixture: ComponentFixture<ServiceTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceTypeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
