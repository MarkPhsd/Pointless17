import { Component, OnInit, SimpleChange , ChangeDetectionStrategy, Output} from '@angular/core';
import { ITVMenuPriceTiers, TVMenuPriceTierItem, TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable} from 'rxjs';
import { EventEmitter } from 'stream';

@Component({
  selector: 'tiers-with-prices',
  templateUrl: './tiers-with-prices.component.html',
  styleUrls: ['./tiers-with-prices.component.scss']
})

export class TiersWithPricesComponent implements OnInit {

  @Output() outPutSetPriceTier = new EventEmitter();

  tvPriceMenuTiers$: Observable<ITVMenuPriceTiers[]>;
  tvPriceMenuTiers: ITVMenuPriceTiers[];

  constructor(
    private tvMenuPriceTierService: TvMenuPriceTierService,
    private siteService:            SitesService)
  { }

  ngOnInit(): void {
    this.initMenuPrices();
  }

  initMenuPrices() {
    this.tvPriceMenuTiers$  = this.tvMenuPriceTierService.getTVMenuPriceTiers(this.siteService.getAssignedSite())
  }

  setPriceTier(name: string) {
    this.outPutSetPriceTier.emit(name)
  }

}


