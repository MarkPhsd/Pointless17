import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogScheduleInfoComponent } from './catalog-schedule-info.component';

describe('CatalogScheduleInfoComponent', () => {
  let component: CatalogScheduleInfoComponent;
  let fixture: ComponentFixture<CatalogScheduleInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatalogScheduleInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogScheduleInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
