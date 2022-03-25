import { Component,  OnInit,  } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, delay, repeatWhen } from 'rxjs/operators';
import { IEighthMenu, IFlowerMenu, TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-strain-board',
  templateUrl: './strain-board.component.html',
  styleUrls: ['./strain-board.component.scss'],  animations: [
    trigger('scroll', [
      state('on', style({left: '-100px'})),
      transition('* => *', [
        style({left: '-100px'}),
        animate(10000, style({left: '100%'}))
      ])
    ])
  ]
})

export class StrainBoardComponent implements OnInit {
  headers: any;
  eighthMenu$: Observable<IEighthMenu[]>;
  eighthMenu: IEighthMenu[]

  constructor(private tvMenuPriceTierService: TvMenuPriceTierService,
              private siteService:            SitesService,
              ) {
      }

  ngOnInit(): void {

    const minutes = 600
    this.eighthMenu$  = this.tvMenuPriceTierService.gGetEighthMenu(this.siteService.getAssignedSite())
    .pipe(
      repeatWhen(notifications =>
        notifications.pipe(
          delay(minutes* 5)),
      ),
      catchError((err: any) => {
        return throwError(err);
      })
    )
    // this.refreshFlowers();
  }


  // refreshFlowers() {
  //   this.eighthMenu$.subscribe( data=> {
  //     this.eighthMenu = data
  //     // this.headers =  [...new Set(this.eighthMenu.map(item => item.))]
  //   })
  // }

}

