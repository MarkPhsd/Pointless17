import { Component, OnInit } from '@angular/core';
import { ITVMenuPriceTiers, TVMenuPriceTierItem, TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, delay, first, map, repeatWhen } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ICompany } from 'src/app/_interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { TiersCardComponent } from './tiers-card/tiers-card.component';
import { TvPriceTierMenuItemsComponent } from '../tv-price-tier-menu-items/tv-price-tier-menu-items.component';

@Component({
  selector: 'app-tv-price-specials',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    TiersCardComponent,
    TvPriceSpecialsComponent,
    TvPriceTierMenuItemsComponent,
  SharedPipesModule],
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
