import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'catalog-schedule-info',
  templateUrl: './catalog-schedule-info.component.html',
  styleUrls: ['./catalog-schedule-info.component.scss']
})
export class CatalogScheduleInfoComponent implements OnInit {

  priceSchedule$ : Observable<IPriceSchedule>
  @Input() priceSchedule  : IPriceSchedule
  @Input() listItemID: number;
  @Input() id: number;
  @Input() parameters: any;
  @Input() refreshTime = 1;
  @Input() ccs: string;

  hideButton = true;
  showText = true;

  constructor(
    private siteService: SitesService,
    private renderer: Renderer2,
    private el: ElementRef,
    private priceScheduleService: PriceScheduleService,) { }

  ngOnInit(): void {
    if (this.priceSchedule) { return }
    if (this.listItemID) { this.id = this.listItemID;}
    if (this.id) {
      const site = this.siteService.getAssignedSite()
      this.priceSchedule$ = this.priceScheduleService.getPriceSchedule(site, this.id).pipe(switchMap(data =>
       {
      this.priceSchedule = data;
      return of(data)
    }))
    }
    this.addStyles(this.ccs);
  }


  addStyles(styles): void {
    const style = this.renderer.createElement('style');
    const text = this.renderer.createText(styles); // Example CSS
    this.renderer.appendChild(style, text);
    this.renderer.appendChild(this.el.nativeElement, style);
  }

}
