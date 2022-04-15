import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTypeSelectionComponent } from './client-type-selection.component';

describe('ClientTypeSelectionComponent', () => {
  let component: ClientTypeSelectionComponent;
  let fixture: ComponentFixture<ClientTypeSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientTypeSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientTypeSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
