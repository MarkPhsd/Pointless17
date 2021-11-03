import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatRateListComponent } from './flat-rate-list.component';

describe('FlatRateListComponent', () => {
  let component: FlatRateListComponent;
  let fixture: ComponentFixture<FlatRateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlatRateListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlatRateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
