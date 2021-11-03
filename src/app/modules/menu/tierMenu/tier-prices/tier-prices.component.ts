import { Component, OnInit, SimpleChange , ChangeDetectionStrategy} from '@angular/core';
import { ITVMenuPriceTiers, TVMenuPriceTierItem, TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable} from 'rxjs';
import { environment } from 'src/environments/environment';
import { ICompany } from 'src/app/_interfaces';

@Component({
  selector: 'app-tier-prices',
  templateUrl: './tier-prices.component.html',
  styleUrls: ['./tier-prices.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TierPricesComponent implements OnInit {

  tvPriceMenuTiers$: Observable<ITVMenuPriceTiers[]>;
  tvPriceMenuTiers: ITVMenuPriceTiers[];
  priceTier: string;
  compName: string;
  company = {} as ICompany;
  logo: string;

  constructor(private tvMenuPriceTierService: TvMenuPriceTierService,
              private siteService:            SitesService)
  { }



  ngOnInit() {
    this.initMenuPrices();

    if (this.company === undefined) {
    } else {
      this.compName = this.company.compName
    }

    this.logo = `${environment.logo}`
    this.compName = `${environment.company}`
  }

  initMenuPrices() {
     this.tvPriceMenuTiers$  = this.tvMenuPriceTierService.getTVMenuPriceTiers(this.siteService.getAssignedSite())
  }


  setPriceTier(tierName: string) {
    this.priceTier = tierName
  }
}

