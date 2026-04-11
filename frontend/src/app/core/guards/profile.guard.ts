import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { DevProfileService } from '../services/dev-profile.service';

export const hasProfileGuard: CanActivateFn = () => {
  const profileService = inject(DevProfileService);
  const router = inject(Router);

  if (profileService.isLoaded()) {
    if (profileService.hasProfile()) {
      return true;
    }
    router.navigate(['/dev/onboarding']);
    return false;
  }

  return profileService.loadProfile().pipe(
    map(() => {
      if (profileService.hasProfile()) {
        return true;
      }
      router.navigate(['/dev/onboarding']);
      return false;
    }),
  );
};

export const noProfileGuard: CanActivateFn = () => {
  const profileService = inject(DevProfileService);
  const router = inject(Router);

  if (profileService.isLoaded()) {
    if (!profileService.hasProfile()) {
      return true;
    }
    router.navigate(['/dev']);
    return false;
  }

  return profileService.loadProfile().pipe(
    map(() => {
      if (!profileService.hasProfile()) {
        return true;
      }
      router.navigate(['/dev']);
      return false;
    }),
  );
};
