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
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';

@Component({
  selector: 'image-light-house',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,GalleryModule],
  templateUrl: './image-light-house.component.html',
  styleUrls: ['./image-light-house.component.scss']
})
export class ImageLightHouseComponent implements OnInit {
  @Input() items: GalleryItem[] = [];
  fullScreenLightbox: boolean
  constructor(
    public galleryService: Gallery,
    public lightbox: Lightbox) {}

  ngOnInit() {
    if (!this.items) { return }
    /** Lightbox Example */  // Get a lightbox gallery ref
    const lightboxRef = this.galleryService.ref('lightbox');
    // Add custom gallery config to the lightbox (optional)
    lightboxRef.setConfig({
      imageSize: ImageSize.Cover,
      thumbPosition: ThumbnailsPosition.Top,
    });
    // Load items into the lightbox gallery ref
    console.log('loading items', this.items)
    lightboxRef.load(this.items);

    console.log('count')
    this.openLightBox()
  }

  openLightBox() {
    if (this.fullScreenLightbox) {

      this.lightbox.open(0, 'lightbox', {panelClass: 'fullscreen'})
    }
    this.lightbox.open(0)
  }
}
