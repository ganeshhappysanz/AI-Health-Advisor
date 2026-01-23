
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/Dashboard';
import { HeaderComponent } from './components/Header';
import { RegistrationFormComponent } from './components/RegistrationForm';
import { DatabaseService } from './services/db.service';
import type { UserProfile } from './types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent, HeaderComponent, RegistrationFormComponent],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <app-header></app-header>
      
      <main class="container mx-auto px-4 py-10">
        <!-- Profile Selection / Login Simulation -->
        <div *ngIf="!activeProfile() && profiles().length > 0 && !isRegistering()" class="max-w-4xl mx-auto">
           <div class="flex justify-between items-center mb-8">
             <h2 class="text-3xl font-black text-slate-800 tracking-tight">Access Secure Records</h2>
             <button (click)="isRegistering.set(true)" class="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg">
               Enroll New Patient
             </button>
           </div>
           
           <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div *ngFor="let p of profiles()" 
                  (click)="activeProfile.set(p)"
                  class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all hover:shadow-md group">
               <div class="flex items-center space-x-4">
                 <div class="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                 </div>
                 <div>
                   <h3 class="font-bold text-slate-800">{{ p.fullName }}</h3>
                   <p class="text-xs text-slate-500">{{ p.diabetesType }} · {{ p.age }}yo</p>
                 </div>
               </div>
               <div class="mt-4 flex items-center text-xs text-indigo-600 font-bold uppercase tracking-wider">
                 View Care Plan
                 <svg class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" /></svg>
               </div>
             </div>
           </div>
        </div>

        <!-- Registration Flow -->
        <div *ngIf="isRegistering() || (profiles().length === 0 && !activeProfile())" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div class="mb-6 max-w-2xl mx-auto flex items-center justify-between">
              <button *ngIf="profiles().length > 0" (click)="isRegistering.set(false)" class="text-slate-500 hover:text-indigo-600 flex items-center font-medium">
                <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" /></svg>
                Back to profiles
              </button>
           </div>
           <app-registration-form (register)="handleRegister($event)"></app-registration-form>
        </div>

        <!-- Active Dashboard -->
        <div *ngIf="activeProfile() && !isRegistering()" class="animate-in zoom-in-95 duration-300">
           <app-dashboard 
              [profile]="activeProfile()!" 
              (onLogout)="activeProfile.set(null)">
           </app-dashboard>
        </div>
      </main>

      <footer class="mt-20 border-t border-slate-200 bg-white py-12">
        <div class="container mx-auto px-4 text-center">
          <div class="inline-flex items-center px-4 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold mb-6">
            <span class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            HIPAA COMPLIANT SIMULATION · LOCAL-FIRST STORAGE
          </div>
          <p class="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            &copy; 2024 GlucoWeight. All patient data is encrypted locally and never transmitted to servers without consent.
          </p>
          <p class="mt-4 text-red-500 text-xs font-black uppercase tracking-widest">
            Disclaimer: Not a medical device. Consult your clinician.
          </p>
        </div>
      </footer>
    </div>
  `,
})
export class AppComponent implements OnInit {
  profiles = signal<UserProfile[]>([]);
  activeProfile = signal<UserProfile | null>(null);
  isRegistering = signal(false);

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    await this.loadProfiles();
  }

  async loadProfiles() {
    const list = await this.db.getAllProfiles();
    this.profiles.set(list);
  }

  async handleRegister(profile: UserProfile) {
    await this.db.saveProfile(profile);
    await this.loadProfiles();
    this.activeProfile.set(profile);
    this.isRegistering.set(false);
  }
}
