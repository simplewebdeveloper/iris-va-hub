import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule, Routes } from '@angular/router';
import { TestComponent } from './test/test.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthGuardService as AuthGuard } from "../auth/auth-guard.service";
import { DeviceDetectorService } from 'ngx-device-detector';

const appRoutes: Routes = [
  {
    path: 'test/:va_id/project_id:',
    component: TestComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'test',
    component: TestComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [TestComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(appRoutes),
    ReactiveFormsModule,
  ],
  exports: [
    TestComponent
  ],
  providers: [DeviceDetectorService],
})
export class TestModule { }
