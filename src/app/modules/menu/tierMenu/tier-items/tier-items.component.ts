import { ChangeDetectionStrategy, Component, ElementRef, Inject, Input, OnChanges, OnInit, SimpleChange, ViewChild } from '@angular/core';
import * as angular from 'angular';
import { Observable, throwError } from 'rxjs';
import { catchError, delay, repeatWhen } from 'rxjs/operators';
import { IFlowerMenu, ITVMenuPriceTiers, TVMenuPriceTierItem, TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-tier-items',
  templateUrl: './tier-items.component.html',
  styleUrls: ['./tier-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TierItemsComponent implements OnInit, OnChanges {

  @Input() priceTier: string;

  headers: any;
  flowers$: Observable<IFlowerMenu[]>;
  flowers: IFlowerMenu[]

  constructor(private tvMenuPriceTierService: TvMenuPriceTierService,
              private siteService:            SitesService,
              ) {
      }


  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (this.flowers$) {
    this.refreshFlowers();
    }
  }

  ngOnInit(): void {

    this.flowers$  = this.tvMenuPriceTierService.getFlowers(this.siteService.getAssignedSite())

    this.refreshFlowers();

  }

  refreshFlowers() {

    if (this.priceTier) {
      this.headers = [this.priceTier]
     } else {
        this.flowers$.subscribe( data=> {
          this.flowers = data
          this.headers =  [...new Set(this.flowers.map(item => item.priceTier))]
        }
      )
    }
  }

}
