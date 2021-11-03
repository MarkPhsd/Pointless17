import { Component, OnInit } from '@angular/core';
import { DevService } from 'src/app/_services';


@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})

export class WishlistComponent implements OnInit {

  devModeOn: boolean;

  constructor(private devService: DevService) { }

  ngOnInit(): void {
    this.devModeOn = this.devService.getdevMode();
  }


}
