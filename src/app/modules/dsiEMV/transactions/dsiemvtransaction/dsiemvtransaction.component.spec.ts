import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DSIEMVTransactionComponent } from './dsiemvtransaction.component';

describe('DSIEMVTransactionComponent', () => {
  let component: DSIEMVTransactionComponent;
  let fixture: ComponentFixture<DSIEMVTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DSIEMVTransactionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DSIEMVTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
