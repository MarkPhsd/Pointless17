import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminbranditemComponent } from './adminbranditem.component';

describe('AdminbranditemComponent', () => {
  let component: AdminbranditemComponent;
  let fixture: ComponentFixture<AdminbranditemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminbranditemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminbranditemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
