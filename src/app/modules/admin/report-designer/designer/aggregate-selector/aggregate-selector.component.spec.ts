import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregateSelectorComponent } from './aggregate-selector.component';

describe('AggregateSelectorComponent', () => {
  let component: AggregateSelectorComponent;
  let fixture: ComponentFixture<AggregateSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AggregateSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AggregateSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
