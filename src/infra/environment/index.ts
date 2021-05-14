import 'dotenv/config';

import { JwtConfig } from '@gateway/security';

import { PostgreConfig } from '@infra/data-source/database/postgresql';

import { test } from './test';

const postgre: PostgreConfig = (process.env.NODE_ENV === 'test')
  ? test.postgre
  : {
    user: process.env.POSTGRE_USER || 'dev',
    host: process.env.POSTGRE_HOST || 'postgre',
    database: process.env.POSTGRE_DATABASE || 'dev',
    password: process.env.POSTGRE_PASSWORD || 'my password',
    port: Number(process.env.POSTGRE_PORT || '5432'),
  };

const jwt: JwtConfig = {
  publicKey: process.env.JWT_PUBLIC_KEY || 'se a chave é pública, melhor nem trancar',
  privateKey: process.env.JWT_PRIVATE_KEY || 'chave? que chave?',
  options: {
    algorithm: process.env.ALGORITHM as JwtConfig['options']['algorithm'] || 'RS256',
    expiresIn: process.env.JWT_DURATION || '1h',
  },
};

export const env = {
  port: process.env.PORT || 3000,
  postgre,
  jwt: jwt,
  externalPrices: {
    alphavantageKey: process.env.ALPHAVANTAGE_API_KEY || '',
  }
};
