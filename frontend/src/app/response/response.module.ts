import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponseComponent } from './response/response.component';
import { Route, RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthGuardService as AuthGuard } from "../auth/auth-guard.service";

const appRoutes: Routes = [
  {
    path: 'responses/:response_id',
    component: ResponseComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'responses',
    component: ResponseComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [ResponseComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(appRoutes),
    ReactiveFormsModule,
  ],
  exports: [
    ResponseComponent,
  ]
})
export class ResponseModule { }
