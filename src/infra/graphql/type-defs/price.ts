import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    lastPrice(ticker: String!): Price!
  }

  type Price {
    ticker: String!
    name: String
    date: String!
    open: Float!
    close: Float!
    min: Float!
    max: Float!
  }
`;
