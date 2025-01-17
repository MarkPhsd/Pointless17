import { Component,  Input,  OnInit,  } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, delay, repeatWhen } from 'rxjs/operators';
import { IEighthMenu, TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatDividerModule } from '@angular/material/divider';
import { StrainCardComponent } from '../strain-card/strain-card.component';

@Component({
  selector: 'app-strain-board',
  standalone: true,
  imports: [CommonModule, StrainCardComponent, MatLegacyCardModule, MatDividerModule],
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
  @Input() chartHeight: any;

  constructor(private tvMenuPriceTierService: TvMenuPriceTierService,
              private siteService:            SitesService,
              ) {
      }

  ngOnInit(): void {

    const minutes = 1000 * 5
    this.eighthMenu$  = this.tvMenuPriceTierService.gGetEighthMenu(this.siteService.getAssignedSite())
    .pipe(
      repeatWhen(notifications =>
        notifications.pipe(
          delay(minutes)),
      ),
      catchError((err: any) => {
        return throwError(err);
      })
    )
  }

}

