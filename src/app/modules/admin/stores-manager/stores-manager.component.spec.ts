import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoresManagerComponent } from './stores-manager.component';

describe('StoresManagerComponent', () => {
  let component: StoresManagerComponent;
  let fixture: ComponentFixture<StoresManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoresManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoresManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
