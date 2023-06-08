import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupByTypesComponent } from './group-by-types.component';

describe('GroupByTypesComponent', () => {
  let component: GroupByTypesComponent;
  let fixture: ComponentFixture<GroupByTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupByTypesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupByTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
