import { Component, OnInit } from '@angular/core';
import { AppInitService } from 'src/app/_services/system/app-init.service';

@Component({
  selector: 'app-tvprice-tiers',
  templateUrl: './price-tiers.component.html',
  styleUrls: ['./price-tiers.component.scss']
})
export class TVPriceTiersComponent implements OnInit {

  logo: string;

  constructor(private appInitService: AppInitService) { }

  ngOnInit(): void {
    this.logo = this.appInitService.logo;
  }

}
