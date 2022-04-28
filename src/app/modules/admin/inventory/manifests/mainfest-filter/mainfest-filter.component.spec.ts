import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainfestFilterComponent } from './mainfest-filter.component';

describe('MainfestFilterComponent', () => {
  let component: MainfestFilterComponent;
  let fixture: ComponentFixture<MainfestFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainfestFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainfestFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
