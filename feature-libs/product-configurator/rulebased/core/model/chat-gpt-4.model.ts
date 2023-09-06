/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export namespace ChatGPT4 {
  export interface Entity {
    id: string;
    name?: string;
    description?: string;
  }
  export interface Group extends Entity {
    attributes: Attribute[];
  }
  export interface Attribute extends Entity {
    isSingleSelection: boolean;
    isMandatory: boolean;
    isReadOnly: boolean;
    values: Value[];
  }
  export interface Value extends Entity {
    price?: string;
    isSelected: boolean;
  }

  export interface Message {
    role: Role;
    content: string;
  }

  export interface Request {
    deployment_id: string;
    messages: Message[];
  }

  export interface Response {
    choices: Choice[];
    created: Date;
    id: string;
    usage: Usage;
  }

  export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
  }

  export interface AccessData {
    accessToken: string;
    tokenType: string;
    expiryDate: Date;
  }

  export interface Choice {
    finish_reason: string;
    index: number;
    message: Message;
  }

  export interface Usage {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  }

  export enum Role {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system',
  }
}
