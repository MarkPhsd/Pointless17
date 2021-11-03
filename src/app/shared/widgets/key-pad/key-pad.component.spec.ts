import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyPadComponent } from './key-pad.component';

describe('KeyPadComponent', () => {
  let component: KeyPadComponent;
  let fixture: ComponentFixture<KeyPadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyPadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyPadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
