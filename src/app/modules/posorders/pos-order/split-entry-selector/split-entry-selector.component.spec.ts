import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitEntrySelectorComponent } from './split-entry-selector.component';

describe('SplitEntrySelectorComponent', () => {
  let component: SplitEntrySelectorComponent;
  let fixture: ComponentFixture<SplitEntrySelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SplitEntrySelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitEntrySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
