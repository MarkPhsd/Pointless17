import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagerBlobComponent } from './pager-blob.component';

describe('PagerBlobComponent', () => {
  let component: PagerBlobComponent;
  let fixture: ComponentFixture<PagerBlobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagerBlobComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagerBlobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
