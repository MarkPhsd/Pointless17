import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteDispatchesComponent } from './route-dispatches.component';

describe('RouteDispatchesComponent', () => {
  let component: RouteDispatchesComponent;
  let fixture: ComponentFixture<RouteDispatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteDispatchesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteDispatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
