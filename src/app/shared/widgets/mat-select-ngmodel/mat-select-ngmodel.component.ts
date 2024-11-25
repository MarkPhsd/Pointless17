import { CommonModule } from '@angular/common';
import { Component, OnInit , Input, Output, EventEmitter} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'mat-select-ngmodel',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './mat-select-ngmodel.component.html',
  styleUrls: ['./mat-select-ngmodel.component.scss']
})
export class MatSelectNGModelComponent implements OnInit {

  @Input()  list$      : Observable<any>;
  @Input()  itemID     : any;
  @Output() outPutItem = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

  setItemID(event) {
    console.log(event.value)
    this.outPutItem.emit(event.value)
  }

}


