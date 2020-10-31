import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule, Routes } from '@angular/router';
import { EditComponent } from './edit/edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthGuardService as AuthGuard } from "../auth/auth-guard.service";

const appRoutes: Routes = [
  {
    path: 'profile/:va_id',
    component: EditComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: EditComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [EditComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(appRoutes),
    ReactiveFormsModule,
  ],
  exports: [
    EditComponent,
  ]
})
export class EditModule { }
