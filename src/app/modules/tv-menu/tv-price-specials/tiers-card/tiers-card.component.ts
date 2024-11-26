import { Component, OnInit } from '@angular/core';
import { ITVMenuPriceTiers,  TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable,  throwError } from 'rxjs';
import { catchError, delay,  repeatWhen } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ICompany } from 'src/app/_interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { LogoComponent } from 'src/app/shared/widgets/logo/logo.component';

@Component({
  selector: 'app-tiers-card',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    LogoComponent,
  SharedPipesModule],
  templateUrl: './tiers-card.component.html',
  styleUrls: ['./tiers-card.component.scss']
})
export class TiersCardComponent implements OnInit {

  tvPriceMenuTiers$: Observable<ITVMenuPriceTiers[]>;
  tvPriceMenuTiers: ITVMenuPriceTiers[];

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

  async initMenuPrices() {

    this.tvPriceMenuTiers$  = this.tvMenuPriceTierService.getTVMenuPriceTiers(this.siteService.getAssignedSite())
      .pipe(
        repeatWhen(notifications => notifications.pipe(delay(1000)),
      ),
      catchError((err: any) => {
        return throwError(err);
      })
    )

  }
}

