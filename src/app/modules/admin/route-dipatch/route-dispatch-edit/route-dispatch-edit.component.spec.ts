import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteDispatchEditComponent } from './route-dispatch-edit.component';

describe('RouteDispatchEditComponent', () => {
  let component: RouteDispatchEditComponent;
  let fixture: ComponentFixture<RouteDispatchEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteDispatchEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteDispatchEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
