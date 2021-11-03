import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandTypeSelectComponent } from './brand-type-select.component';

describe('BrandTypeSelectComponent', () => {
  let component: BrandTypeSelectComponent;
  let fixture: ComponentFixture<BrandTypeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandTypeSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandTypeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
