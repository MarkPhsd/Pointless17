import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { ITVMenuPriceTiers, TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable} from 'rxjs';
import { AuthenticationService } from 'src/app/_services';
import { PriceTierMethodsService } from 'src/app/_services/menu/price-tier-methods.service';

@Component({
  selector: 'tiers-with-prices',
  templateUrl: './tiers-with-prices.component.html',
  styleUrls: ['./tiers-with-prices.component.scss']
})

export class TiersWithPricesComponent implements OnInit {

  @Output() outPutSetPriceTier = new EventEmitter();
  isAuthorized: boolean
  tvPriceMenuTiers$: Observable<ITVMenuPriceTiers[]>;
  tvPriceMenuTiers: ITVMenuPriceTiers[];

  constructor(
    private authenticationService: AuthenticationService,
    private tvMenuPriceTierService: TvMenuPriceTierService,
    private priceTierMethods: PriceTierMethodsService,
    private siteService:            SitesService)
  { }

  ngOnInit(): void {
    const user$ = this.authenticationService.user$.subscribe(data =>  {
      if (data) {
        if (data?.roles.toLowerCase() == 'admin' || data?.roles.toLowerCase() == 'manager'){
          this.isAuthorized = true
        }
      }
    })

    this.initMenuPrices();
  }

  initMenuPrices() {
    this.tvPriceMenuTiers$  = this.tvMenuPriceTierService.getTVMenuPriceTiers(this.siteService.getAssignedSite())

    this.tvPriceMenuTiers$.subscribe(data => {
      this.tvPriceMenuTiers= data;
      this.tvPriceMenuTiers = this.tvPriceMenuTiers.filter(data => {
        return data.webEnabled
      })
    })
  }

  editTier(id:number) {
    this.priceTierMethods.openPriceTier(id)
  }

  setPriceTier(name: string) {
    this.outPutSetPriceTier.emit(name)
  }

}


