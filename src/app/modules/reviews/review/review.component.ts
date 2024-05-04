import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IClientTable, IProduct, IUserProfile } from 'src/app/_interfaces';
import { Review } from 'src/app/_interfaces/menu/menu-products';
import { AuthenticationService, UserService } from 'src/app/_services';
import { ReviewsService } from 'src/app/_services/people/reviews.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {

  reviewForm: UntypedFormGroup

  review: Review;

  user: IUserProfile;

  get reviewNotes() { return this.reviewForm.get("review") as UntypedFormControl; }
  get ratingValue() { return this.reviewForm.get("review") as UntypedFormControl;}

  canDelete: boolean;
  // get taxable() { return this.productForm.get("taxable") as FormControl;}


  constructor(private http: HttpClient,
              private reviewService: ReviewsService,
              private fb: UntypedFormBuilder,
              public route: ActivatedRoute,
              private _snackBar: MatSnackBar,
              private authenticationService: AuthenticationService,
              private userService: UserService) {


  }

  ngOnInit(): void {


  }



}
