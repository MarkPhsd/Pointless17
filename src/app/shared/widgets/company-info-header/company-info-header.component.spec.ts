import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyInfoHeaderComponent } from './company-info-header.component';

describe('CompanyInfoHeaderComponent', () => {
  let component: CompanyInfoHeaderComponent;
  let fixture: ComponentFixture<CompanyInfoHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyInfoHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyInfoHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
