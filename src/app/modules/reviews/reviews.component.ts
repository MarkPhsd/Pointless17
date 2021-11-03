import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Review } from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, UserService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { ReviewsService } from 'src/app/_services/people/reviews.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  @Input() productID:     any;
  @Input() driverID:      any;

  @Input() itemName:      string;
  @Input() ratingCount:   number;
  @Input() ratingAverage: number;

  @Input() reviews:       Review[]
  reviews$:               Observable<Review[]>;
  bucketName:             string;

  constructor(private reviewsService: ReviewsService,
              private awsService: AWSBucketService,
              private client: ClientTableService,
              private siteService: SitesService) { }

  async ngOnInit() {

    this.bucketName =   await this.awsService.awsBucket();

    if (this.productID) {
      this.reviews$ = this.reviewsService.getReviewsOfProduct(this.siteService.getAssignedSite(), this.productID);
    }

    if (this.driverID) {

    }

  }

  getImageSrc(image: string) {
    if (image) {
      return this.awsService.getImageURLPath(this.bucketName, image)
    }
  }

  public getClient(id: number): any {
    console.log(id)
    if (id) {
      let client$ =  this.client.getClient(this.siteService.getAssignedSite(), id)

      client$.subscribe( data => {
        console.log(data.firstName)
        return data.firstName
      }).unsubscribe()

    }
  }

}
