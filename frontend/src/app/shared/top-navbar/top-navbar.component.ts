import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../auth/auth.service";

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.css']
})
export class TopNavbarComponent implements OnInit {
  public loggedIn: boolean;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    // interval(5000)
    // .subscribe((val) => { 
    //   if(this.authService.isLoggedIn()) {
    //     this.loggedIn = true;
    //   } else {
    //     this.loggedIn = false;
    //   }
    //  });
  }

  ngDoCheck(): void {
    //Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.
    //Add 'implements DoCheck' to the class.
    if(this.authService.isLoggedIn()) {
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }
    
  }


}
