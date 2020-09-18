import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateComponent } from './create/create.component';
import { Routes, RouterModule } from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import { AuthGuardService as AuthGuard } from "../auth/auth-guard.service";

const appRoutes: Routes = [
  {
    path: 'create',
    component: CreateComponent,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  declarations: [CreateComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(appRoutes),
    ReactiveFormsModule
  ],
  exports: [
  ]
})
export class CreateModule { }
