import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatRateEditComponent } from './flat-rate-edit.component';

describe('FlatRateEditComponent', () => {
  let component: FlatRateEditComponent;
  let fixture: ComponentFixture<FlatRateEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlatRateEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlatRateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
