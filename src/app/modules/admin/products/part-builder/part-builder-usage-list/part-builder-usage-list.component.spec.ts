import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartBuilderUsageListComponent } from './part-builder-usage-list.component';

describe('PartBuilderUsageListComponent', () => {
  let component: PartBuilderUsageListComponent;
  let fixture: ComponentFixture<PartBuilderUsageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartBuilderUsageListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartBuilderUsageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
