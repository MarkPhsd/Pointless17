import { Component, Input } from '@angular/core';
import { ISite } from 'src/app/_interfaces';
import { AWSBucketService } from 'src/app/_services';

@Component({
  selector: 'app-site-card',
  templateUrl: './site-card.component.html',
  styleUrls: ['./site-card.component.scss']
})
export class SiteCardComponent {

  @Input() site: ISite;
  @Input() bucketName: string;

  constructor(private awsBucketService: AWSBucketService) {
  }

  getImageURL(imageName: string): string {
    if (imageName) {
      return  this.awsBucketService.getImageURLPath(this.bucketName, imageName)
    }
    return ''
  }
}
