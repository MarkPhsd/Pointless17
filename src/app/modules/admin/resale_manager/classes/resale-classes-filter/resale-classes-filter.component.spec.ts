import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResaleClassesFilterComponent } from './resale-classes-filter.component';

describe('ResaleClassesFilterComponent', () => {
  let component: ResaleClassesFilterComponent;
  let fixture: ComponentFixture<ResaleClassesFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResaleClassesFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResaleClassesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
