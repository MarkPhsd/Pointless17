import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPrintersElectronComponent } from './list-printers-electron.component';

describe('ListPrintersElectronComponent', () => {
  let component: ListPrintersElectronComponent;
  let fixture: ComponentFixture<ListPrintersElectronComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPrintersElectronComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPrintersElectronComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
