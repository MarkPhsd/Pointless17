import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTypesLookupComponent } from './client-types-lookup.component';

describe('ClientTypesLookupComponent', () => {
  let component: ClientTypesLookupComponent;
  let fixture: ComponentFixture<ClientTypesLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientTypesLookupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientTypesLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
