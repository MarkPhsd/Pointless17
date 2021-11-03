import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressUploaderComponent } from './progress-uploader.component';

describe('ProgressUploaderComponent', () => {
  let component: ProgressUploaderComponent;
  let fixture: ComponentFixture<ProgressUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressUploaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
