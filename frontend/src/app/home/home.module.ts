import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotCardsComponent } from './bot-cards/bot-cards.component';
import { SharedModule } from '../shared/shared.module'
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuardService as AuthGuard } from "../auth/auth-guard.service";

const appRoutes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  }
]

@NgModule({
  declarations: [BotCardsComponent, HomeComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(appRoutes)
  ],
  exports: [
    BotCardsComponent,
    SharedModule
  ]
})

export class HomeModule { }
