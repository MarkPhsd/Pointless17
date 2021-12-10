import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tvprice-tiers',
  templateUrl: './price-tiers.component.html',
  styleUrls: ['./price-tiers.component.scss']
})
export class TVPriceTiersComponent implements OnInit {

  logo: string;

  constructor() { }

  ngOnInit(): void {
    this.logo = `${environment.logo}`
  }

}
