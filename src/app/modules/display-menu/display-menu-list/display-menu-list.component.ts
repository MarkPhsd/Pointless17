import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatestAll, forkJoin, Observable, of, switchMap } from 'rxjs';
import { IDisplayMenu } from 'src/app/_interfaces/menu/price-schedule';
import { AWSBucketService } from 'src/app/_services';
import { DisplayMenuService } from 'src/app/_services/menu/display-menu.service';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'display-menu-list',
  templateUrl: './display-menu-list.component.html',
  styleUrls: ['./display-menu-list.component.scss']
})
export class DisplayMenuListComponent implements OnInit {

  menu: IDisplayMenu;
  id: number;

  action$: Observable<any>;
  obs$ : Observable<any>[];
  bucket: string;
  // containerStyle = "{ 'background': 'cement.png' | asUrl,
  //                     'background-repeat': 'repeat', 'height': '500vh'}"

  containerStyle = ``
  containerBackground = 'cemement.png';

  getContainerBackground(backgroundImage: string) {
    this.containerStyle = ''
    const background = this.getItemSrc(backgroundImage);
    if (!background || background == undefined) { return }
    this.containerStyle =`{background: ${background},
                          'background-repeat': 'repeat', height: '500vh'`;
  }

  getItemSrc(nameArray: string) {
    return this.awsBucket.getImageURLFromNameArray(this.bucket, nameArray)
  }

  getPlaceHolder() {
    return this.awsBucket.getPlaceHolderImage() // this.placeHolderImage
  }

  constructor(
      public route: ActivatedRoute,
      private priceScheduleService: PriceScheduleService,
      private siteService: SitesService,
      private awsBucket         : AWSBucketService,
      private renderer : Renderer2,
      private displayMenuService: DisplayMenuService, ) {

    this.id = +this.route.snapshot.paramMap.get('id');
    // this.id = 2;
  }

  // <!-- {{containerStyle}} -->

  loadStyles() {
    const styles = this.menu.css;
    if (!this.menu?.css) {return }
    const style = document.createElement('style');
    style.innerHTML = styles;
    document.head.appendChild(style);
  }

  ngOnInit(): void {

    const i =0
    const site   = this.siteService.getAssignedSite();

    this.action$ = this.getBucket().pipe(
      switchMap(data => {
        this.bucket = data.preassignedURL;
        return  this.displayMenuService.getMenu(site, this.id)
      })).pipe(
      switchMap(data => {

        if (data.backgroundImage) {
          this.getContainerBackground(data.backgroundImage)
        }

        //so here we have to get all the list of the item, and
        this.obs$ = []
        if (!data || !data?.menuSections) {
          return of('no menu')
        }
        const list = JSON.parse(data?.menuSections);
        list.forEach(item => {
          this.obs$.push(this.priceScheduleService.getPriceScheduleFull(site, item.id))
        });

        this.menu = data;
        this.loadStyles();

        forkJoin(this.obs$)
        return  forkJoin(this.obs$)
      })
    )

  }

  getBucket() {
    return this.awsBucket.getAWSBucketObservable().pipe(
      switchMap( data => {
        this.bucket = data.preassignedURL;
        return of(data)
      })
    )
  }

}
