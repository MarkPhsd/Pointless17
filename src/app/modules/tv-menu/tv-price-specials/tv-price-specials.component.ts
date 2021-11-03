import { Component, OnInit } from '@angular/core';
import { ITVMenuPriceTiers, TVMenuPriceTierItem, TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, delay, first, map, repeatWhen } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ICompany } from 'src/app/_interfaces';

@Component({
  selector: 'app-tv-price-specials',
  templateUrl: './tv-price-specials.component.html',
  styleUrls: ['./tv-price-specials.component.scss']
})

export class TvPriceSpecialsComponent implements OnInit {

  tvPriceMenuTiers$: Observable<ITVMenuPriceTiers[]>;
  tvPriceMenuTiers: ITVMenuPriceTiers[];

  compName: string;
  company = {} as ICompany;
  logo: string;

  constructor(private tvMenuPriceTierService: TvMenuPriceTierService,
              private siteService:            SitesService)
  { }

  ngOnInit() {

    if (this.company === undefined) {
    } else {
      this.compName = this.company.compName
    }

    this.logo = `${environment.logo}`
    this.compName = `${environment.company}`
  }




}
