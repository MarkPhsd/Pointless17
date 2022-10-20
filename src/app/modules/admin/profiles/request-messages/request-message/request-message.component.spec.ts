import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestMessageComponent } from './request-message.component';

describe('RequestMessageComponent', () => {
  let component: RequestMessageComponent;
  let fixture: ComponentFixture<RequestMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
