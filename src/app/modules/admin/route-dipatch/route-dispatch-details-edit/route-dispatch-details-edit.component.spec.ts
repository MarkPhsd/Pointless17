import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteDispatchDetailsEditComponent } from './route-dispatch-details-edit.component';

describe('RouteDispatchDetailsEditComponent', () => {
  let component: RouteDispatchDetailsEditComponent;
  let fixture: ComponentFixture<RouteDispatchDetailsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteDispatchDetailsEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteDispatchDetailsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
