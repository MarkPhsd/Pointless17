import { Component, Input, OnInit } from '@angular/core';
import { IEighthMenu } from 'src/app/_services/menu/tv-menu-price-tier.service';

@Component({
  selector: 'app-strain-card',
  templateUrl: './strain-card.component.html',
  styleUrls: ['./strain-card.component.scss']
})
export class StrainCardComponent implements OnInit {
  @Input()  item : IEighthMenu;

  constructor() { }

  ngOnInit(): void {
    const i = 0;
  }

}
