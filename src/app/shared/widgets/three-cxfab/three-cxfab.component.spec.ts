import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeCXFabComponent } from './three-cxfab.component';

describe('ThreeCXFabComponent', () => {
  let component: ThreeCXFabComponent;
  let fixture: ComponentFixture<ThreeCXFabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreeCXFabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreeCXFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
