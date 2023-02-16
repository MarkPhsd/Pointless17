import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosSplitGroupsComponent } from './pos-split-groups.component';

describe('PosSplitGroupsComponent', () => {
  let component: PosSplitGroupsComponent;
  let fixture: ComponentFixture<PosSplitGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosSplitGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosSplitGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
