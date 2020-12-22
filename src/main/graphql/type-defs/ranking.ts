import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    lastRanking: [Ranking!]
  }

  type Ranking {
    player: Player!
    score: Int!
    matchDate: String!
    heroes: [Hero!]!
  }

  type Player {
    name: String!
    country: String!
  }

  type Hero {
    name: String!
    level: Int!
  }
`;
