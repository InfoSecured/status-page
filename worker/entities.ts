/**
 * Minimal real-world demo: One Durable Object instance per entity (User, ChatBoard), with Indexes for listing.
 */
import { Entity, IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage, Vendor, ServiceNowConfig, SolarWindsConfig, CollaborationBridge } from "@shared/types";
import type { Env } from './core-utils';
// USER ENTITY: one DO instance per user
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
}
// CHAT BOARD ENTITY: one DO instance per chat board, stores its own messages
export type ChatBoardState = Chat & { messages: ChatMessage[] };
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate((s) => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}
// VENDOR ENTITY: one DO instance per vendor
export class VendorEntity extends IndexedEntity<Vendor> {
  static readonly entityName = "vendor";
  static readonly indexName = "vendors";
  static readonly initialState: Vendor = {
    id: "",
    name: "",
    url: "",
    statusType: 'MANUAL',
    apiUrl: null,
    jsonPath: null,
    expectedValue: null,
  };
  static readonly seedData: ReadonlyArray<Vendor> = [
    {
      id: 'vendor-01',
      name: 'CrowdStrike',
      url: 'https://status.crowdstrike.com/',
      statusType: 'API_JSON',
      apiUrl: 'https://status.crowdstrike.com/api/v2/status.json',
      jsonPath: 'status.indicator',
      expectedValue: 'none',
    },
    { id: 'vendor-02', name: 'Citrix', url: 'https://status.cloud.com/', statusType: 'MANUAL' },
    { id: 'vendor-03', name: 'FIS', url: '#', statusType: 'MANUAL' },
    { id: 'vendor-04', name: 'Sectigo', url: 'https://sectigo.status.io/', statusType: 'MANUAL' },
    { id: 'vendor-05', name: 'Five9', url: 'https://status.five9.com/', statusType: 'MANUAL' },
    { id: 'vendor-06', name: 'SolarWinds', url: 'https://status.solarwinds.com/', statusType: 'MANUAL' },
  ];
}
// SERVICENOW CONFIG ENTITY: Singleton for storing integration settings
export class ServiceNowConfigEntity extends Entity<ServiceNowConfig> {
  static readonly entityName = "servicenow-config";
  static readonly singletonId = "global-config";
  static readonly initialState: ServiceNowConfig = {
    id: ServiceNowConfigEntity.singletonId,
    enabled: false,
    instanceUrl: '',
    usernameVar: 'SERVICENOW_USERNAME',
    passwordVar: 'SERVICENOW_PASSWORD',
    outageTable: 'cmdb_ci_outage',
    fieldMapping: {
      systemName: 'cmdb_ci.name',
      impactLevel: 'u_impact_level',
      startTime: 'begin',
      eta: 'end',
      description: 'short_description',
      teamsBridgeUrl: 'u_teams_bridge_url',
    },
    ticketTable: 'incident',
    ticketFieldMapping: {
      id: 'number',
      summary: 'short_description',
      affectedCI: 'cmdb_ci.name',
      status: 'state',
      assignedTeam: 'assignment_group.name',
      priority: 'priority',
    }
  };
  constructor(env: Env) {
    super(env, ServiceNowConfigEntity.singletonId);
  }
}
// SOLARWINDS CONFIG ENTITY: Singleton for storing integration settings
export class SolarWindsConfigEntity extends Entity<SolarWindsConfig> {
  static readonly entityName = "solarwinds-config";
  static readonly singletonId = "global-config";
  static readonly initialState: SolarWindsConfig = {
    id: SolarWindsConfigEntity.singletonId,
    enabled: false,
    apiUrl: '',
    usernameVar: 'SOLARWINDS_USERNAME',
    passwordVar: 'SOLARWINDS_PASSWORD',
  };
  constructor(env: Env) {
    super(env, SolarWindsConfigEntity.singletonId);
  }
}
// COLLABORATION BRIDGE ENTITY: one DO instance per bridge
export class CollaborationBridgeEntity extends IndexedEntity<CollaborationBridge> {
  static readonly entityName = "collaboration-bridge";
  static readonly indexName = "collaboration-bridges";
  static readonly initialState: CollaborationBridge = {
    id: "",
    title: "",
    participants: 0,
    duration: "0m",
    isHighSeverity: false,
    teamsCallUrl: "",
  };
  static readonly seedData: ReadonlyArray<CollaborationBridge> = [
    {
      id: 'bridge-01',
      title: 'SEV1: API Gateway Latency',
      participants: 12,
      duration: '42m',
      isHighSeverity: true,
      teamsCallUrl: '#',
    },
    {
      id: 'bridge-02',
      title: 'SEV2: Auth Service Errors',
      participants: 7,
      duration: '1h 15m',
      isHighSeverity: true,
      teamsCallUrl: '#',
    },
    { id: 'bridge-03', title: 'War Room: Database Performance', participants: 5, duration: '23m', isHighSeverity: false, teamsCallUrl: '#' },
  ];
}