import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from "./auth/auth-interceptor";

// Custom modules
import { SharedModule } from '../app/shared/shared.module';
import { HomeModule } from '../app/home/home.module';
import { CreateModule } from './create/create.module';
import { TrainModule } from '../app/train/train.module';
import { EditModule } from './edit/edit.module';
import { AuthModule } from './auth/auth.module'
import { SettingsModule } from './settings/settings.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Routes, RouterModule, CanActivate } from '@angular/router';
import { EditComponent } from './edit/edit/edit.component';
import {ReactiveFormsModule} from '@angular/forms';
import { AuthGuardService} from "./auth/auth-guard.service";
import { AuthService } from './auth/auth.service';


const appRoutes: Routes = [
  {
    path: '',
    loadChildren: './auth/auth.module#AuthModule',
    
  },
  {
    path: 'login',
    loadChildren: './auth/auth.module#AuthModule',
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomeModule',
    
  },
  {
    path: 'create',
    loadChildren: './create/create.module#CreateModule',
    
  },
  {
     path: 'edit',
    loadChildren: './edit/edit.module#EditModule',
   
  },
  {
    path: 'train',
    loadChildren: './train/train.module#TrainModule',
    
  },
  {
    path: 'settings',
    loadChildren: './settings/settings.module#SettingsModule',
    
  },
];

@NgModule({
  declarations: [
    AppComponent,
    EditComponent,
  ],
  imports: [
    BrowserModule,
    SharedModule,
    HomeModule,
    CreateModule,
    TrainModule,
    EditModule,
    SettingsModule,
    AuthModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
