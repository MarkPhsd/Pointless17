
import {  Component, ElementRef,AfterViewInit,
  OnInit,
  Input,
 } from '@angular/core';
import { AWSBucketService,  MenuService} from 'src/app/_services';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { trigger, transition, animate, style, query, stagger } from '@angular/animations';
import { Observable, } from 'rxjs';
import { IPriceSchedule,
         IPriceSearchModel,
         PS_SearchResultsPaged } from 'src/app/_interfaces/menu/price-schedule';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'scheduled-menu-container',
  templateUrl: './scheduled-menu-container.component.html',
  styleUrls: ['./scheduled-menu-container.component.scss'],
  animations: [
    trigger('pageAnimations', [
      transition(':enter', [
        query('.photo-record, .menu li, form', [
          style({opacity: 0, transform: 'translateY(-100px)'}),
          stagger(-30, [
            animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('filterAnimation', [
      transition(':enter, * => 0, * => -1', []),
      transition(':increment', [
        query(':enter', [
          style({ opacity: 0, width: '0px' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, width: '*' })),
          ]),
        ])
      ]),
      transition(':decrement', [
        query(':leave', [
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 0, width: '0px' })),
          ]),
        ])
      ]),
    ]),
    trigger('listAnimation', [
      transition('* => 3', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-100px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'none' })),
          ]),
        ])
      ]),
      transition('1 => 2', [
        query(':enter', [
          style({ position: 'absolute', opacity: 0, transform: 'translateX(-100px)' })
        ]),
        query(':leave', [
          style({ opacity: 1, transform: 'translateX(0px)' }),
          animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(100px)' })),
          style({ position: 'absolute' }),
        ]),
        query(':enter', [
          style({ position: 'static' }),
          animate('300ms ease-out', style({ opacity: 1, transform: 'none' })),
        ])
      ]),
      transition('2 <=> 1', [
        query(':enter', [
          style({ position: 'absolute', opacity: 0, transform: 'translateX(100px)' })
        ]),
        query(':leave', [
          style({ opacity: 1, transform: 'translateX(0px)' }),
          animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-100px)' })),
          style({ position: 'absolute' }),
        ]),
        query(':enter', [
          style({ position: 'static' }),
          animate('300ms ease-out', style({ opacity: 1, transform: 'none' })),
        ])
      ]),
      transition('* => 1, * => 2', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-100px)' }),
          animate('300ms ease-out', style({ opacity: 1, transform: 'none' })),
        ])
      ]),
    ]),
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class ScheduledMenuContainerComponent implements OnInit {

  bucket: string;
  scheduleMenus$: Observable<PS_SearchResultsPaged>;
  scheduleMenus : IPriceSchedule[];
  @Input() item  : IPriceSchedule
  classcontainer   : string;
  orderslist       : string;
  singlePage       : boolean;
  href             : string;
  imagePath        : string;
  isApp: boolean;
  showAllFlag = false;
  url: string;

  constructor(
                private titleService    :       Title,
                private awsBucketService:       AWSBucketService,
                private platFormService:        PlatformService,
                private siteService:            SitesService,
                private priceScheduleService:   PriceScheduleService,
    ) {

    }
    async ngOnInit() {
      this.isApp = this.platFormService.isApp();
      this.bucket = await this.awsBucketService.awsBucketURL()
      if (this.item && this.item.image && this.bucket) {
        this.url = `${this.bucket}${this.item.image}`
      }
      // this.initScheduleMenus()
    }

    initScheduleMenus() {
      const site = this.siteService.getAssignedSite();
      const search =  {} as IPriceSearchModel
      search.pageNumber = 1
      search.pageSize = 30;
      search.active = true;
      search.type = 'menu list'
      this.scheduleMenus$ = this.priceScheduleService.getListBySearch(site, search)
    }

    initClass(placement) {
      if (this.href === '/scheduled-menus') {
        this.singlePage = true
        this.classcontainer = 'parent-container-single-page'
        this.orderslist = 'orders-list-single-page'
      }
      if (this.href != '/scheduled-menus') {
        this.singlePage = false
        this.classcontainer = 'parent-container'
        this.orderslist     = 'orders-list'
      }
    }

    toggleItems() {
      this.showAllFlag = !this.showAllFlag;
    }

    async getImagePath(name: string) {
      if (name && this.bucket ) {
        this.imagePath = `${this.bucket}${name}`
        return this.imagePath;
      }
    }

}
