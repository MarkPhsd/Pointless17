import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleReaderComponent } from './scale-reader.component';

describe('ScaleReaderComponent', () => {
  let component: ScaleReaderComponent;
  let fixture: ComponentFixture<ScaleReaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScaleReaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
