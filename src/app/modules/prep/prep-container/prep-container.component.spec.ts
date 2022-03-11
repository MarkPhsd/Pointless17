import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepContainerComponent } from './prep-container.component';

describe('PrepContainerComponent', () => {
  let component: PrepContainerComponent;
  let fixture: ComponentFixture<PrepContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrepContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrepContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
