export interface PermissionResponse {
  id: string;
  code?: string;
  name: string;
  description?: string;
  module?: string;
  moduleId?: string;
  moduleCode?: string;
}

export interface JwkKey {
  kty: string;
  use: string;
  kid: string;
  alg: string;
  n: string;
  e: string;
}

export interface JwksResponse {
  keys: JwkKey[];
}
