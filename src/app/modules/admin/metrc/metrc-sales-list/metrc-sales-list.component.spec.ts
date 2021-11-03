import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetrcSalesListComponent } from './metrc-sales-list.component';

describe('MetrcSalesListComponent', () => {
  let component: MetrcSalesListComponent;
  let fixture: ComponentFixture<MetrcSalesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetrcSalesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetrcSalesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
