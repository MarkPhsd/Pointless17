import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDateSelectorComponentComponent } from './customer-date-selector-component.component';

describe('CustomerDateSelectorComponentComponent', () => {
  let component: CustomerDateSelectorComponentComponent;
  let fixture: ComponentFixture<CustomerDateSelectorComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerDateSelectorComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDateSelectorComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
