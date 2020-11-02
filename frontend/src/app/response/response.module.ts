import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponseComponent } from './response/response.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from "../auth/auth-guard.service";

const appRoutes: Routes = [
  {
    path: 'response',
    component: ResponseComponent,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  declarations: [ResponseComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(appRoutes),
  ],
  exports:[
    ResponseComponent
  ]
})
export class ResponseModule { }
