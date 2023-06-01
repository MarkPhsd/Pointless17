import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicAgGridComponent } from './dynamic-ag-grid.component';

describe('DynamicAgGridComponent', () => {
  let component: DynamicAgGridComponent;
  let fixture: ComponentFixture<DynamicAgGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicAgGridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicAgGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
