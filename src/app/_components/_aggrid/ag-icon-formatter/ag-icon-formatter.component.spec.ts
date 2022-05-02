import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgIconFormatterComponent } from './ag-icon-formatter.component';

describe('AgIconFormatterComponent', () => {
  let component: AgIconFormatterComponent;
  let fixture: ComponentFixture<AgIconFormatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgIconFormatterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgIconFormatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
