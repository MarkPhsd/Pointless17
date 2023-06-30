import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseAccountsListComponent } from './house-accounts-list.component';

describe('HouseAccountsListComponent', () => {
  let component: HouseAccountsListComponent;
  let fixture: ComponentFixture<HouseAccountsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HouseAccountsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HouseAccountsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
