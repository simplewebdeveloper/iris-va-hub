import { Component, OnInit} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from "../../auth/auth.service";

@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.css']
})
export class LeftnavComponent implements OnInit {
  private currentPath = ""

  constructor(private router: Router, private authService: AuthService) { 
  }

  ngOnInit() {
    this.router.events.subscribe(
      (event: any) => {
        if (event instanceof NavigationEnd) {
          this.currentPath = this.router.url;
          // this.currentPath = this.currentPath.replace('/', '');
          this.currentPath = this.currentPath.replace(/[0-9]/g, '');
          this.currentPath = this.currentPath.replace(/\\|\//g,'');

        }
      }
    );
  }

  logout() {
    this.authService.logout();
  }


}
