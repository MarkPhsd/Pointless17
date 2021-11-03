import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesToUserComponent } from './messages-to-user.component';

describe('MessagesToUserComponent', () => {
  let component: MessagesToUserComponent;
  let fixture: ComponentFixture<MessagesToUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MessagesToUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesToUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
