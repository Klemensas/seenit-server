import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  extend type Query {
    settings: Settings!
  }

  extend type Mutation {
    updateSettings(
      general: GeneralSettingsInput!
      extension: ExtensionSettingsInput!
    ): Settings!
    addToExtensionBlacklist(
      blacklistItem: String!
    ): Settings!
  }

  type Settings {
    id: ID!
    general: GeneralSettings!
    extension: ExtensionSettings!
    user: User!
  }

  type GeneralSettings {
    autoConvert: Boolean!
  }

  type ExtensionSettings {
    autoTrack: Boolean!
    minLengthSeconds: Int!
    blacklist: [String!]!
  }

  input GeneralSettingsInput {
    autoConvert: Boolean!
  }

  input ExtensionSettingsInput {
    autoTrack: Boolean!
    minLengthSeconds: Int!
    blacklist: [String!]!
  }
`;
