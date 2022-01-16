import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POSOrderServiceTypeComponent } from './posorder-service-type.component';

describe('POSOrderServiceTypeComponent', () => {
  let component: POSOrderServiceTypeComponent;
  let fixture: ComponentFixture<POSOrderServiceTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ POSOrderServiceTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(POSOrderServiceTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
