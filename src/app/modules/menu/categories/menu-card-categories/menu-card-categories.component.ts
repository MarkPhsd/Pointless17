import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AWSBucketService } from 'src/app/_services';
@Component({
  selector: 'menu-card-category',
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
  constructor(private awsBucket: AWSBucketService) { }

  ngOnInit(): void {
    const i = 0;
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

  getItemSrc(nameArray: string) {
    return this.awsBucket.getImageURLFromNameArray(this.bucket, nameArray)
  }
}
