import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOperationsComponent } from './pos-operations.component';

describe('PosOperationsComponent', () => {
  let component: PosOperationsComponent;
  let fixture: ComponentFixture<PosOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOperationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
