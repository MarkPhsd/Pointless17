import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitepointsComponent } from './sitepoints.component';

describe('SitepointsComponent', () => {
  let component: SitepointsComponent;
  let fixture: ComponentFixture<SitepointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SitepointsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitepointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
