import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminbrandslistComponent } from './adminbrandslist.component';

describe('AdminbrandslistComponent', () => {
  let component: AdminbrandslistComponent;
  let fixture: ComponentFixture<AdminbrandslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminbrandslistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminbrandslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
