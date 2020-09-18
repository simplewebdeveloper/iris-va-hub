import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {TrainIntentsComponent} from './train-intents/train-intents.component';
import { TrainSvpsComponent } from './train-svps/train-svps.component';
import { TrainModelComponent } from './train-model/train-model.component';
import { AuthGuardService as AuthGuard } from "../auth/auth-guard.service";


const appRoutes: Routes = [
  {
    path: 'intents',
    component: TrainIntentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'svps',
    component: TrainSvpsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'train',
    component: TrainModelComponent,
    canActivate: [AuthGuard],
  }
];


@NgModule({
  declarations: [TrainIntentsComponent, TrainSvpsComponent, TrainModelComponent],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(appRoutes),
    ReactiveFormsModule
  ],
  exports: [
  ]
})
export class TrainModule { }
