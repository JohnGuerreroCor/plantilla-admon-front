import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NavbarHiddenService } from 'src/app/services/navbar-hidden.service';
import { FotoService } from 'src/app/services/foto.service';
import { FotoAntigua } from '../../../models/foto-antigua';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  public perCodigo: any = this.auth.user.personaCodigo;
  public perCodigoAntigua: any = '' + this.auth.user.personaCodigo;
  public nombre: any = this.auth.user.personaNombre;
  public apellido: any = this.auth.user.personaApellido;
  public uaa: any = this.auth.user.uaaNombre;
  public roles: any[] = this.auth.user.roles;
  public rol: any = this.roles.toString();

  url: any = environment.URL_BACKEND;
  panelOpenState = false;

  foto: FotoAntigua = {
    url: '',
  };

  public foundMenuItems = [];

  private fotoLoaded = false; // Variable para controlar si la foto se ha cargado

  isHandset$: Observable<any> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    public auth: AuthService,
    private router: Router,
    public navbarHiddenService: NavbarHiddenService,
    public fotoService: FotoService
  ) {}

  hideHintsErrorStateMatcher: ErrorStateMatcher = {
    isErrorState(
      control: FormControl | null,
      form: FormGroupDirective | NgForm | null
    ): boolean {
      return !!(
        control &&
        control.invalid &&
        (control.dirty || control.touched)
      );
    },
  };

  receiveMessage($event: any) {
    this.rol = $event;
  }

  logout(): void {
    this.auth.logout();
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: 'success',
      title: 'Sesión cerrada correctamente.',
    });
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.loadFoto(); // Llamada inicial para cargar la foto
  }

  loadFoto() {
    if (!this.fotoLoaded) {
      // Verificar si la foto ya se ha cargado
      this.fotoService.mirarFoto('' + this.perCodigo).subscribe((data) => {
        var gg = new Blob([data], { type: 'application/json' });
        if (gg.size !== 4) {
          var blob = new Blob([data], { type: 'image/png' });
          const foto = blob;
          const reader = new FileReader();
          reader.onload = () => {
            this.foto.url = reader.result as string;
          };
          reader.readAsDataURL(foto);
        } else {
          this.fotoService
            .mirarFotoAntigua('' + this.perCodigo)
            .subscribe((data) => {
              this.foto = data;
            });
        }
      });

      this.fotoLoaded = true; // Marcar que la foto se ha cargado
    }
  }

  toggle() {
    this.navbarHiddenService.toggleSideBar();
  }

  buscar() {}
}
