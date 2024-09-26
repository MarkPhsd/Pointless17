import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageMenuSenderComponent } from './message-menu-sender.component';

describe('MessageMenuSenderComponent', () => {
  let component: MessageMenuSenderComponent;
  let fixture: ComponentFixture<MessageMenuSenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MessageMenuSenderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageMenuSenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
