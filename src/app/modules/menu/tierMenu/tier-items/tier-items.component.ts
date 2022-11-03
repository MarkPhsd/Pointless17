import { Component, Input, OnChanges, OnInit, SimpleChange,  } from '@angular/core';
import { Observable,  } from 'rxjs';
import { MenuService } from 'src/app/_services/menu/menu.service';
import { IFlowerMenu,  ITVMenuPriceTiers,  TVMenuPriceTierItem,  TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-tier-items',
  templateUrl: './tier-items.component.html',
  styleUrls: ['./tier-items.component.scss'],
})
export class TierItemsComponent implements OnInit {

  @Input()  priceTier: string;
  imageUrl: string;
  headers : any;
  flowers$: Observable<IFlowerMenu[]>;
  flowers : IFlowerMenu[]

  // id:   priceTier: flower.priceTier

  constructor(private tvMenuPriceTierService: TvMenuPriceTierService,
              private siteService:              SitesService,
              private menuService             : MenuService,
              private orderMethodsService     : OrderMethodsService,

              ) {
      }

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite();
    this.flowers$  = this.tvMenuPriceTierService.getFlowers(site)
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

  navMenuItem(flower: IFlowerMenu) {

    if (flower) {
      this.tvMenuPriceTierService.updateTierFlowerMenu(flower)
      if (!flower.id) { return }

      const site = this.siteService.getAssignedSite();
      this.menuService.getMenuItemByID(site, flower.id).subscribe(data => {
        console.log('menu item', data?.name)
        if (!data) { return }
        this.menuService.updateCurrentMenuItem(data)
        this.orderMethodsService.menuItemActionPopUp(null, data, false)
      })

    }

  }

  // this.imageUrl = this.getItemSrc(data.image)
  // getItemSrc(image: string) {
  //   if (!image) {
  //     return this.awsBucket.getImageURLPath(this.bucketName, "placeholderproduct.jpg")
  //   } else {
  //     return this.awsBucket.getImageURLPath(this.bucketName, image)
  //   }
  // }


}
