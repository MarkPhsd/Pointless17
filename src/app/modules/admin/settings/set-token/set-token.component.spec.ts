import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetTokenComponent } from './set-token.component';

describe('SetTokenComponent', () => {
  let component: SetTokenComponent;
  let fixture: ComponentFixture<SetTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetTokenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
