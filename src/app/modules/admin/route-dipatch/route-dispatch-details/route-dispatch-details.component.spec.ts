import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteDispatchDetailsComponent } from './route-dispatch-details.component';

describe('RouteDispatchDetailsComponent', () => {
  let component: RouteDispatchDetailsComponent;
  let fixture: ComponentFixture<RouteDispatchDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteDispatchDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteDispatchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
