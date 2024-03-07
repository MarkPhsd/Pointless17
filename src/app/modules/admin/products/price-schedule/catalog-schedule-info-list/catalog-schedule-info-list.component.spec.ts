import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogScheduleInfoListComponent } from './catalog-schedule-info-list.component';

describe('CatalogScheduleInfoListComponent', () => {
  let component: CatalogScheduleInfoListComponent;
  let fixture: ComponentFixture<CatalogScheduleInfoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatalogScheduleInfoListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogScheduleInfoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
