import {  Component, ElementRef, OnInit, } from '@angular/core';
import { IProductCategory }  from 'src/app/_interfaces';
import { AWSBucketService, MenuService} from 'src/app/_services';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { CommonModule } from '@angular/common';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-categories-alternate',
  standalone: true,
  imports: [CommonModule,MatLegacyCardModule, MatLegacyButtonModule,MatIconModule,],
  templateUrl: './categories-alternate.component.html',
  styleUrls: ['./categories-alternate.component.scss']
})
export class CategoriesAlternateComponent implements OnInit {

  public categories:     IProductCategory[] = [];
  bucketName:            string;

  constructor(
    private menuService:     MenuService,
    private awsBucket:       AWSBucketService,
    private router:          Router,
    private siteService:     SitesService,
    private el:              ElementRef,
   )  {
}

async ngOnInit() {
     this.bucketName =   await this.awsBucket.awsBucket();


    const categories$ = this.menuService.getCategoryListNoChildren(this.siteService.getAssignedSite(),)
    categories$.subscribe(data=> {
      this.categories = data
    })


    const slider = document.querySelector('.items')  as HTMLElement
    this.el.nativeElement.offsetTop

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('mousemove', (e) => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 3; //scroll-fast
      slider.scrollLeft = scrollLeft - walk;
      console.log(walk);
    });

  }

  showAll() {
    this.router.navigate(["/categories/"]);
  }

  listItems(id:number) {
    this.router.navigate(["/menuitems/", {id:id}]);
  }


  getCatSource(item: IProductCategory) {
     this.getItemSrc(item.urlImageMain)
  }

  getItemSrc(nameArray: string) {
    return this.awsBucket.getImageURLFromNameArray(this.bucketName, nameArray)
  }

  getImage(item) {
    return `https://${this.bucketName}.s3.amazonaws.com/${item?.urlImageMain}`
  }

}
