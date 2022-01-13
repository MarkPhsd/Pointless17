import { Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { environment } from 'src/environments/environment';
import { ICompany } from 'src/app/_interfaces';
import { AppInitService } from 'src/app/_services/system/app-init.service';

@Component({
  selector: 'app-tier-prices',
  templateUrl: './tier-prices.component.html',
  styleUrls: ['./tier-prices.component.scss'],
})

export class TierPricesComponent implements OnInit {

  priceTier: string;
  compName: string;
  company = {} as ICompany;
  logo: string;

  constructor(
    private appInitService        : AppInitService,)
  { }

  ngOnInit() {

    this.appInitService.init();
    if (this.company === undefined) {
    } else {
      this.compName = this.company.compName
    }

    this.logo     = `${this.appInitService.logo}`
    this.compName = `${this.appInitService.company}`
  }

  setPriceTier(tierName: string) {
    this.priceTier = tierName
  }
}

