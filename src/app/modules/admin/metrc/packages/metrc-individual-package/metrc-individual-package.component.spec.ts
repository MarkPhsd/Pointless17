import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetrcIndividualPackageComponent } from './metrc-individual-package.component';

describe('MetrcIndividualPackageComponent', () => {
  let component: MetrcIndividualPackageComponent;
  let fixture: ComponentFixture<MetrcIndividualPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetrcIndividualPackageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetrcIndividualPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
