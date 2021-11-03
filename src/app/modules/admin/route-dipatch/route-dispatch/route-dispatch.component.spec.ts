import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteDispatchComponent } from './route-dispatch.component';

describe('RouteDispatchComponent', () => {
  let component: RouteDispatchComponent;
  let fixture: ComponentFixture<RouteDispatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteDispatchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteDispatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
