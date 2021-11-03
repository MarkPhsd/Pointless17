import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetrcInventoryPropertiesComponent } from './metrc-inventory-properties.component';

describe('MetrcInventoryPropertiesComponent', () => {
  let component: MetrcInventoryPropertiesComponent;
  let fixture: ComponentFixture<MetrcInventoryPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetrcInventoryPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetrcInventoryPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
