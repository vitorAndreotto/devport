import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { CompanyProfileService } from '../services/company-profile.service';

export const hasCompanyProfileGuard: CanActivateFn = () => {
  const profileService = inject(CompanyProfileService);
  const router = inject(Router);

  if (profileService.isLoaded()) {
    if (profileService.hasProfile()) {
      return true;
    }
    router.navigate(['/company/onboarding']);
    return false;
  }

  return profileService.loadProfile().pipe(
    map(() => {
      if (profileService.hasProfile()) {
        return true;
      }
      router.navigate(['/company/onboarding']);
      return false;
    }),
  );
};

export const noCompanyProfileGuard: CanActivateFn = () => {
  const profileService = inject(CompanyProfileService);
  const router = inject(Router);

  if (profileService.isLoaded()) {
    if (!profileService.hasProfile()) {
      return true;
    }
    router.navigate(['/company']);
    return false;
  }

  return profileService.loadProfile().pipe(
    map(() => {
      if (!profileService.hasProfile()) {
        return true;
      }
      router.navigate(['/company']);
      return false;
    }),
  );
};
