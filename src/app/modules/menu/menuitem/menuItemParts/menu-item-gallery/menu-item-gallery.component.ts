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
  @Input()  gallery = 'gallery'
  @Input() zoomEnabled : boolean;
  zoomStyle = ''
  galleryZoomStyle =''
  zoomValue = 100
  galleryZoomValue = 200;
      //these are from the components as well.
  _imagesOther:           any[];
  urlImageOther:          string ;
  _imagesMain:            any[];
  urlImageMain:           string ;
  bucketName:             string;
  awsBucketURL:           string;
  items:                  GalleryItem[];
  @Input() images: string;
  constructor(
    private awsBucket         : AWSBucketService,
  ) { }

  async  ngOnInit() {
    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.getGallery();
    if (this.zoomEnabled) { 
      this.zoomStyle        = `height:100px`
      // this.galleryZoomStyle = `height:200px`
    }
  }

  zoom(value) {
    this.zoomValue += value 
    if (this.zoomValue == 600){ 
      this.zoomValue = 600
    }
    if (this.zoomValue == 0){ 
      this.zoomValue = 100
    }
    this.galleryZoomValue  = this.zoomValue + 100;
    this.galleryZoomStyle  = `height:${this.galleryZoomValue}px`
    this.zoomStyle         = `height:${this.zoomValue}px`
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

      }
    }

    // console.log('split images', this.images.split(','))
    if (!this.menuItem) { 
      if (!this.images) { 
        this.images = 'placeHolder.png'
      }
      if (this.images) { 
        this._imagesMain = this.awsBucket.convertToArrayWithUrl( this.images, this.awsBucketURL);
        this.items =  this._imagesMain.map(image => new ImageItem({ src: image, thumb: image }));
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
