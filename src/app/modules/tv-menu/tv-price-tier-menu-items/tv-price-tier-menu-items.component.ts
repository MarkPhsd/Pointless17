import { Component,  OnInit,  } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, delay, repeatWhen } from 'rxjs/operators';
import { IFlowerMenu, TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';


@Component({
  selector: 'app-tv-price-tier-menu-items',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './tv-price-tier-menu-items.component.html',
  styleUrls: ['./tv-price-tier-menu-items.component.scss'],
  animations: [
    trigger('scroll', [
      state('on', style({left: '-100px'})),
      transition('* => *', [
        style({left: '-100px'}),
        animate(10000, style({left: '100%'}))
      ])
    ])
  ]
})

export class TvPriceTierMenuItemsComponent implements OnInit {

  headers: any;
  flowers$: Observable<IFlowerMenu[]>;
  flowers: IFlowerMenu[]

  constructor(private tvMenuPriceTierService: TvMenuPriceTierService,
              private siteService:            SitesService,
              ) {

      }

  ngOnInit(): void {

    this.flowers$  = this.tvMenuPriceTierService.getFlowers(this.siteService.getAssignedSite())
    .pipe(
      repeatWhen(notifications =>
        notifications.pipe(
          delay(10000)),
      ),
      catchError((err: any) => {
        return throwError(err);
      })
    )

    this.refreshFlowers();

  }

  refreshFlowers() {
    this.flowers$.subscribe( data=> {
      this.flowers = data
      this.headers =  [...new Set(this.flowers.map(item => item.priceTier))]
    })
  }

}
