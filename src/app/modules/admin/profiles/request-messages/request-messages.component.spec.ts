import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestMessagesComponent } from './request-messages.component';

describe('RequestMessagesComponent', () => {
  let component: RequestMessagesComponent;
  let fixture: ComponentFixture<RequestMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestMessagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
