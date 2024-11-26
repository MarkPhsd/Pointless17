import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IClientTable, IProduct, IUserProfile } from 'src/app/_interfaces';
import { Review } from 'src/app/_interfaces/menu/menu-products';
import { AuthenticationService, UserService } from 'src/app/_services';
import { ReviewsService } from 'src/app/_services/people/reviews.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';


@Component({
  selector: 'app-review-edit',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './review-edit.component.html',
  styleUrls: ['./review-edit.component.scss'],
})
export class ReviewEditComponent implements OnInit {

  reviewForm: UntypedFormGroup

  @Input() product: IProduct;
  @Input() client: IClientTable;
  @Input() id: any;
  @Input() rating: Review
  @Input() ratingValue: number;
  @Input() ratingAverage: number;

  review$: Observable<Review>;
  review: Review;

  user: IUserProfile;

  get reviewNotes() { return this.reviewForm.get("reviewNotes") as UntypedFormControl;}

  adminOptionsOn: boolean;
  // get taxable() { return this.productForm.get("taxable") as FormControl;}


  constructor(private http: HttpClient,
              private reviewService: ReviewsService,
              private fb: UntypedFormBuilder,
              public route: ActivatedRoute,
              private _snackBar: MatSnackBar,
              private authenticationService: AuthenticationService,
              private siteService: SitesService,
              private userService: UserService) {

    this.id = this.route.snapshot.paramMap.get('id');

  }

  ngOnInit(): void {

    this.reviewForm = this.fb.group( {
      id:           [0],
      reviewDate:   [new Date() ],
      clientID:     [0],
      productID:    [0],
      sku:          [0],
      reviewNotes:  ['', Validators.required],
      ratingValue:  [ , Validators.required],
      activeReview: [''],
      poDetailID:   [''],
      reivewResponse: [''],

    })
    //then pipe the data from the review if there is is one.
    if (this.id) {
      this.review$ = this.reviewService.getReview(this.siteService.getAssignedSite(), this.id).pipe(
        tap(data =>
          {this.reviewForm.patchValue(data)
            this.review = data
          }
        )
     );
    }

   if (this.review) {
    this.userService.getProfile().subscribe(data=>
      {
        this.user = data

        if (this.user.roles === "admin" || this.user.roles === "manager") {
          this.adminOptionsOn = true
        } else {

          if (this.user.roles === "user") {
           this.review.clientID = this.user.id
          }

          if (this.user.id != this.review.clientID) {
              //then lock the form
              this.reviewForm.disable()
          }

        }
      }
    )
    }
  }

  saveItem(){
    console.log(this.reviewForm.value)

    if (this.reviewForm.valid) {


      if (this.id && this.id != 0) {
        this.reviewService.putReview(this.siteService.getAssignedSite(), this.id, this.reviewForm.value).subscribe( data =>
          {
            this.notifyEvent("Review updated.", "Notification.")
          })
      }
      } else {
        this.reviewService.postReview(this.siteService.getAssignedSite(), this.reviewForm.value).subscribe( data =>
          {
            this.notifyEvent("Review Saved.", "Notification.")
          })
      }
  }

  onSubmit() {

  }

  deleteItem() {

    if (this.id) {
      this.reviewService.deleteReview(this.siteService.getAssignedSite(), this.id).subscribe( data=> {
        this.notifyEvent("Review Deleted.", "Notification.")
      })
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  ngOnDestroy() {
    this.review$.subscribe().unsubscribe()
  }

}
