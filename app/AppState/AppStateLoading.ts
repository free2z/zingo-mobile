import { TranslateOptions } from 'i18n-js';
import { StackScreenProps } from '@react-navigation/stack';

import TotalBalanceClass from './classes/TotalBalanceClass';

import InfoType from './types/InfoType';
import WalletSeedType from './types/WalletSeedType';
import DimensionsType from './types/DimensionsType';
import zecPriceType from './types/zecPriceType';
import backgroundType from './types/backgroundType';

export default interface AppStateLoading {
  navigation: StackScreenProps<any>['navigation'];
  route: StackScreenProps<any>['route'];
  dimensions: DimensionsType;
  appState: string;

  screen: number;
  actionButtonsDisabled: boolean;
  walletExists: boolean;
  walletSeed: WalletSeedType;
  totalBalance: TotalBalanceClass;
  info: InfoType;

  server: string;
  currency: 'USD' | '';
  language: 'en' | 'es';

  zecPrice: zecPriceType;
  sendAll: boolean;
  background: backgroundType;

  translate: (key: string, config?: TranslateOptions) => string;

  // eslint-disable-next-line semi
}
