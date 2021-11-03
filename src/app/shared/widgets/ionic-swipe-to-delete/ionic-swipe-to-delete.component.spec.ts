import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IonicSwipeToDeleteComponent } from './ionic-swipe-to-delete.component';

describe('IonicSwipeToDeleteComponent', () => {
  let component: IonicSwipeToDeleteComponent;
  let fixture: ComponentFixture<IonicSwipeToDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IonicSwipeToDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IonicSwipeToDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
