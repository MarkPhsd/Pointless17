import { CommonModule } from '@angular/common';
import { Component, Input, OnInit} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-activity-toggles',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './activity-toggles.component.html',
  styleUrls: ['./activity-toggles.component.scss']
})
export class ActivityTogglesComponent implements OnInit {
  @Input()  inputForm:      UntypedFormGroup;
  constructor() { }

  ngOnInit(): void {
    // console.log('')
  }

}
