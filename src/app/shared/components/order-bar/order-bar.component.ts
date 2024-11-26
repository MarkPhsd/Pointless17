import { Component, OnInit, ViewChild } from '@angular/core';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { PosOrderComponent } from 'src/app/modules/posorders/pos-order/pos-order.component';

@Component({
  selector: 'app-order-bar',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    PosOrderComponent,
  ],
  templateUrl: './order-bar.component.html',
  styleUrls: ['./order-bar.component.scss']
})

export class OrderBarComponent implements OnInit {

  @ViewChild('drawer') drawer: any;

  selectedItem = '';

  public isHandset$: Observable<boolean> = this.breakpointObserver
          .observe(Breakpoints.Handset)
          .pipe(map((result: BreakpointState) => result.matches));

  constructor(private breakpointObserver: BreakpointObserver) { }

  ngOnInit(): void {
    this.refreshSideBar();
  }

  refreshSideBar(){
  }

}
