import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartBuilderFilterComponent } from './part-builder-filter.component';

describe('PartBuilderFilterComponent', () => {
  let component: PartBuilderFilterComponent;
  let fixture: ComponentFixture<PartBuilderFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartBuilderFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartBuilderFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
