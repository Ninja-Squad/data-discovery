import { WheatisModule } from '../app/wheatis/wheatis.module';

export const environment = {
  production: true,
  links: [
    { label: 'INRA', url: 'http://www.inra.fr/' },
    { label: 'URGI', url: 'https://urgi.versailles.inra.fr/' }
  ],
  resourceModule: WheatisModule
};
