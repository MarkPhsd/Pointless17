
import { Component,  HostListener, ElementRef, HostBinding,
         OnInit,  } from '@angular/core';
import { IProductCategory }  from 'src/app/_interfaces';
import { AWSBucketService, MenuService} from 'src/app/_services';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import {  Subject} from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

// https://codeburst.io/how-to-create-horizontal-scrolling-containers-d8069651e9c6
//we are only using one section now.
// https://dev.to/angular/ain-t-nobody-needs-hostlistener-fg4

@Component({
  selector: 'app-category-scroll',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './category-scroll.component.html',
  styleUrls: ['./category-scroll.component.scss']
})
export class CategoryScrollComponent implements OnInit {

  @HostBinding('@pageAnimations')

  categories$: Observable<IProductCategory[]>;
  isDown =    false;
  startX:     any;
  scrollLeft: any;
  href:       string;
  slider:     HTMLElement;
  section:    number;
  bucket:     string
  private destroy$ = new Subject<void>();
  public style = {};

  constructor(
                private menuService:     MenuService,
                private awsBucket:       AWSBucketService,
                private router:          Router,
                private siteService:     SitesService,
                private el:              ElementRef,
   )
  {
    this.section = 1
  }

  async ngOnInit() {
    this.bucket =   await this.awsBucket.awsBucket();
    const site = this.siteService.getAssignedSite()
    this.href = this.router.url;
    this.categories$ = this.menuService.getCategoryListNoChildren(site)
  }

  @HostListener('mousedown', ['$event'])  onMouseDown(event: any) {
    if (this.href === '/categories') { return}

    if (!this.slider) { this.slider = document.querySelector('.items')  as HTMLElement }

    if ( this.slider) {
      this.isDown = true;
      this.slider.classList.add('active');
      this.startX = event.pageX - this.slider.offsetLeft;
      this.scrollLeft = this.slider.scrollLeft;
    }
  }

  @HostListener('mouseleave', ['$event']) onMouseLeave(event: any) {
    if (this.href === '/categories') { return}

    if (!this.slider) { this.slider = document.querySelector('.items')  as HTMLElement }

    if ( this.slider) {
      this.isDown = false;
      this.slider.classList.remove('active');
    }
  }

  @HostListener('mouseup', ['$event']) onMouseUp(event: any) {
    if (this.href === '/categories') { return}

    if (!this.slider) { this.slider = document.querySelector('.items')  as HTMLElement }

    if ( this.slider) {
      this.isDown = false;
      this.slider.classList.remove('active');
    }
  }

  @HostListener('mousemove', ['$event']) onMouseMove(event: any) {
    if (this.href === '/categories') { return}

    if (!this.slider) { this.slider = document.querySelector('.items')  as HTMLElement }

    if(!this.isDown) { return; }

    if (this.slider) {
      event.preventDefault();
      const x = event.pageX - this.slider.offsetLeft;
      const walk = (x -  this.startX) * 3; //scroll-fast
      this.slider.scrollLeft =  this.scrollLeft - walk;
    }
  }

  showAll() {
    this.router.navigate(["/categories/"]);
  }

  listItems(id:number) {
    this.router.navigate(["/menuitems/", {id:id}]);
  }

  getCategorySrc(item: IProductCategory) {
    return this.getItemSrc(item.urlImageMain)
  }

  getItemSrc(nameArray: string) {
    return this.awsBucket.getImageURLFromNameArray(this.bucket, nameArray)
  }


}
