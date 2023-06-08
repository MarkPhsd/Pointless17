import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AndOrSelectorComponent } from './and-or-selector.component';

describe('AndOrSelectorComponent', () => {
  let component: AndOrSelectorComponent;
  let fixture: ComponentFixture<AndOrSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AndOrSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AndOrSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
