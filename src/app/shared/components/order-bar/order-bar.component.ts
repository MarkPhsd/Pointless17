import { Component, OnInit, ViewChild } from '@angular/core';
import { IUserProfile }  from 'src/app/_interfaces';
import { UserService} from 'src/app/_services';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-order-bar',
  templateUrl: './order-bar.component.html',
  styleUrls: ['./order-bar.component.scss']
})
export class OrderBarComponent implements OnInit {

  @ViewChild('drawer') drawer: any;

  selectedItem = '';

  public isHandset$: Observable<boolean> = this.breakpointObserver
          .observe(Breakpoints.Handset)
          .pipe(map((result: BreakpointState) => result.matches));

  constructor(private userService: UserService,
              private breakpointObserver: BreakpointObserver) { }

  ngOnInit(): void {
    this.refreshSideBar();
  }

  refreshSideBar(){

  }



}
