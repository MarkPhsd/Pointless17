import { Component, OnInit, Input } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { Gallery, GalleryItem, ImageItem } from '@ngx-gallery/core';
import { AWSBucketService, MenuService, OrdersService } from 'src/app/_services';

@Component({
  selector: 'app-menu-item-gallery',
  templateUrl: './menu-item-gallery.component.html',
  styleUrls: ['./menu-item-gallery.component.scss']
})
export class MenuItemGalleryComponent implements OnInit {

  @Input() menuItem    : IMenuItem;

      //these are from the components as well.
  _imagesOther:           any[];
  urlImageOther:          string ;
  _imagesMain:            any[];
  urlImageMain:           string ;
  bucketName:             string;
  awsBucketURL:           string;
  items:                  GalleryItem[];

  constructor(
    private awsBucket         : AWSBucketService,
  ) { }

  async  ngOnInit() {
    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.getGallery();
  }

  getGallery() {

    if (this.menuItem) {
      if (this.menuItem.urlImageOther != undefined) {
        this._imagesOther = this.awsBucket.convertToArrayWithUrl( this.menuItem.urlImageOther,  this.awsBucketURL);
      }

      if (this.menuItem.urlImageMain != undefined) {
        this._imagesMain = this.awsBucket.convertToArrayWithUrl( this.menuItem.urlImageMain, this.awsBucketURL);
      }

      this._imagesMain = this.awsBucket.addImageArraytoArray(this._imagesMain, this._imagesOther)
      try {
        if(this._imagesMain) {
          if (!this.items) { this.items = []}
          this.items =  this._imagesMain.map(image => new ImageItem({ src: image, thumb: image }));
        }
      } catch (error) {
        console.log(error)
      }
    }

  }

  updateUrlImageMain($event) {
    this.urlImageMain = $event
    this.menuItem.urlImageMain = $event
  }

  updateUrlImageOther($event) {
    this.urlImageOther = $event
     this.menuItem.urlImageOther = this.urlImageOther
  }
}
