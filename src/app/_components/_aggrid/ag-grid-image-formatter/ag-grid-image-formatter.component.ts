import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';


@Component({
  selector: 'app-ag-grid-image-formatter',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './ag-grid-image-formatter.component.html',
  styleUrls: ['./ag-grid-image-formatter.component.scss']
})

//make sure to pass in the awsBucket URL included in the params
//this.awsService.awsBucketURL()
export class AgGridImageFormatterComponent {

  imagePath: string;

  agInit(params: any){
    if (!params) {
      this.imagePath = ''
      return
    }
    try {
      if (params.value) {
        this.imagePath = params.value;
      }
    } catch (error) {

    }

  }

}
