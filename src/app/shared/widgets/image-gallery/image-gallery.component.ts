import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  GalleryModule,
  GalleryItem,
  ImageItem,
  ImageSize,
  ThumbnailsPosition,
  Gallery,
} from 'ng-gallery';
import { LightboxModule, Lightbox } from 'ng-gallery/lightbox';
import 'hammerjs';
import { AWSBucketService } from 'src/app/_services';

import { UUID } from 'angular2-uuid';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,GalleryModule],
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],

})
export class ImageGalleryComponent implements OnInit {

  @Input() fullScreenLightbox : boolean
  @Input() galleryView : boolean ;
  @Input() styleValue = "height:clamp(10vh, 10vh, 200px);width: clamp(10vh, 15vw, 300px);"
  @Input() imageList: string;
  @Input() imagesIncludeUrl: boolean;
  @Input() imageData = [];
  items: GalleryItem[] = [];
  awsBucketURL: string;

  lightBoxIndex: string;
  galleryID: string;
  enableLightHouse: boolean;
  phoneDevice: boolean;

  constructor(
    private awsBucket: AWSBucketService,
    public gallery: Gallery,
    public lightbox: Lightbox) {}


  async ngOnInit() {

    if (window.innerWidth < 599) {
      this.phoneDevice = true
    }


    this.galleryID = `gallery${UUID.UUID()}`
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    //if
    if (!this.imageData) {

      if (!this.imageList) { this.imageList = 'placeHolder.png' }

      const images = this.imageList;

      if (this.imagesIncludeUrl) {
        this.imageData = this.awsBucket.convertImageListToArray(images);
        console.log('retrieving list')
      } else {
        this.imageData = this.awsBucket.convertToArrayWithUrl(images, this.awsBucketURL);
      }
    } else {
      console.log('items', this.items)
      console.log('image data received', this.imageData)
        // const imageLink = this.awsBucket.convertToArrayWithUrl(this.imageList, this.awsBucketURL);

        // if (this.imagesIncludeUrl) {
        //   this.imageData = this.awsBucket.convertImageListToArray(images);
        // } else {
        //   this.imageData = this.awsBucket.convertToArrayWithUrl(images, this.awsBucketURL);
        // }


    }

    this.items = this.imageData.map(
      (item) => new ImageItem({ src: item, thumb: item })
    );

    this.lightBoxIndex = `lightbox-${UUID.UUID()}`
    const lightboxRef = this.gallery.ref(this.galleryID);

    // Add custom gallery config to the lightbox (optional)
    lightboxRef.setConfig({
      imageSize: ImageSize.Cover,
      thumbPosition: ThumbnailsPosition.Left,
    });

    // Load items into the lightbox gallery ref
    lightboxRef.load(this.items);
  }

  openLightBoxView() {
    if (!this.items) { return }
    this.lightbox.open(0, this.galleryID, {panelClass: 'fullscreen'})
  }

  getGallery(imageData : any[]) {
    if (!imageData || imageData.length == 0) {
      imageData = []
      imageData.push('placeHolder.png')
    }
    if (imageData) {
      // here we could compbine both lists.
      // this.imageData = this.awsBucket.addImageArraytoArray(this._imagesMain, this._imagesOther)
      // this.items =  this._imagesMain.map(image => new ImageItem({ src: image, thumb: image }));
      this.items = this.getImagesFromArray(imageData)
    }
  }

  getImagesFromArray(imagesMain: any[]) {
    return  imagesMain.map(image => {
      return {
        type: "imageViewer",
        data: {
          src:  image ,
          thumb: image
        }
      };
    });
  }

}


