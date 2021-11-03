import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarycardComponent } from './summarycard.component';

describe('SummarycardComponent', () => {
  let component: SummarycardComponent;
  let fixture: ComponentFixture<SummarycardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummarycardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummarycardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
