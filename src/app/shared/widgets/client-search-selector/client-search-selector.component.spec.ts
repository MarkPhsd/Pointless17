import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSearchSelectorComponent } from './client-search-selector.component';

describe('ClientSearchSelectorComponent', () => {
  let component: ClientSearchSelectorComponent;
  let fixture: ComponentFixture<ClientSearchSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientSearchSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientSearchSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
