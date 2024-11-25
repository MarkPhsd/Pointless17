import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AWSBucketService } from 'src/app/_services';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'menu-card-category',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

  templateUrl: './menu-card-categories.component.html',
  styleUrls: ['./menu-card-categories.component.scss']
})
export class MenuCardCategoriesComponent implements OnInit {

  @Input()  item: any;
  @Output() outPutEditItem = new EventEmitter<any>();
  @Output() outPutlistItems = new EventEmitter<any>();
  @Output() outPutgetItemSrc = new EventEmitter<any>();
  @Output() outPutNextPage = new EventEmitter<any>();
  @Input()  bucket: string;
  @Input()  imageName: string;
  @Input()  isAdmin: boolean;
  @Input()  textLength: number = 15;
  @Input()  disableImages: boolean;
  constructor(public awsBucket: AWSBucketService) { }

  urlImage: string;

  ngOnInit(): void {
    const i = 0;
    if (this.item && this.bucket) {
      this.urlImage = this.getItemSrc(this.item)
    } else {
      if (!this.item && this.bucket) {
        const image =`https://${this.bucket}.s3.amazonaws.com/placeholderproduct.png`
        this.urlImage = image;
      }
    }
  }

  editItem(item) {
    this.outPutEditItem.emit(item)
  }

  listItems(id: number) {
    this.outPutlistItems.emit(id)
  }

  nextPage() {
    this.outPutNextPage.emit(true)
  }

  getItemSrc(item:any) {
    const thumbnail = item?.thumbNail ?? item?.urlImageMain;
    // console.log(thumbnail, this.bucket)con
    if (thumbnail) {
      const thumbnail = item?.thumbNail ?? item?.urlImageMain;
      const imageName =  thumbnail.split(",")
      if (!imageName || imageName.length == 0) {
        return null
      }
      const image =`https://${this.bucket}.s3.amazonaws.com/${imageName[0]}`
      return image
    }
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/placeholderimage.png'; // Angular will resolve this path correctly.
  }
}
