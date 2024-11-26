import { style } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit,Input, ElementRef, Renderer2 } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { IPriceSchedule, IPriceSearchModel } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { text } from 'stream/consumers';
import { CatalogScheduleInfoComponent } from '../catalog-schedule-info/catalog-schedule-info.component';

@Component({
  selector: 'catalog-schedule-info-list',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    CatalogScheduleInfoComponent,
  SharedPipesModule],
  templateUrl: './catalog-schedule-info-list.component.html',
  styleUrls: ['./catalog-schedule-info-list.component.scss']
})
export class CatalogScheduleInfoListComponent implements OnInit {

list$ : Observable<IPriceSchedule[]>;
@Input() ccs: string;

constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private siteService: SitesService,
    private priceScheduleService: PriceScheduleService,) { }

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite()
    const search = {} as IPriceSearchModel;
    search.active = true;
    this.list$ =this.priceScheduleService.getList(site).pipe(switchMap(data => {
      data.filter( item => { return item.active })
      data.filter( item => { return item.type && item.type.toLowerCase() != 'menu list'  })
      return of(data);
    }));
    this.addStyles(this.ccs)
  }

  addStyles(styles): void {
    const style = this.renderer.createElement('style');
    const text = this.renderer.createText(styles); // Example CSS
    this.renderer.appendChild(style, text);
    this.renderer.appendChild(this.el.nativeElement, style);
  }
}
