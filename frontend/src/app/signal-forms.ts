import { provideSignalFormsConfig } from '@angular/forms/signals';

export const provideDdSignalFormsConfig = () =>
  provideSignalFormsConfig({
    classes: {
      'is-invalid': binding => binding.state().touched() && binding.state().invalid()
    }
  });
