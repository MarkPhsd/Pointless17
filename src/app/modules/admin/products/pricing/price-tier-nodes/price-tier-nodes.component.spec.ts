import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceTierNodesComponent } from './price-tier-nodes.component';

describe('PriceTierNodesComponent', () => {
  let component: PriceTierNodesComponent;
  let fixture: ComponentFixture<PriceTierNodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceTierNodesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceTierNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
