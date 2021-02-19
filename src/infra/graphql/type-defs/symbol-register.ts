import { gql } from 'apollo-server-express';

export default gql`
  extend type Mutation {
    symbolRegister(ticker: String!, symbols: [Symbol!]!): JSON
  }

  input Symbol {
    source: String!
    symbol: String!
  }
`;
