import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-profile-idcard-info',

  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './profile-idcard-info.component.html',
  styleUrls: ['./profile-idcard-info.component.scss']
})
export class ProfileIDCardInfoComponent implements OnInit {
  @Input() inputForm : UntypedFormGroup;
  @Input() isAuthorized: boolean;

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
