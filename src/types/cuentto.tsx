export interface CuenttoGroup {
  id: number;
  name: string;
  emoji?: string | null;
  description?: string | null;
  default?: boolean;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cuentto {
  id: number;
  title: string;
  description: string;
  duration: number;
  createdAt: string;
  slug?: string | null;
  publicLink?: string | null;
  isPublic?: boolean;
  isSelfShared?: boolean;
  isGroupCuentto?: boolean;
  moodId?: number;
  musicId?: number | null;
  groupIds?: number[];
  groups?: CuenttoGroup[];
  mood: {
    id?: number;
    title: string;
    color: string;
  };
  user: {
    id: number;
    username: string;
    usernameSlug?: string | null;
    profileName: string;
    profilePicture?: string;
  };
    music: {
    id: number;
    name: string;
    musicFile: number;
  } | null;
  _count: {
    comments: number;
  };
}

// A row from GET /api/savecuentto — the join record, with the saved cuentto
// itself nested under `cuentto` (same shape the feed returns).
export interface SavedCuentto {
  id: number;
  userId: number;
  cuenttoId: number;
  createdAt: string;
  cuentto: Cuentto;
}

export interface FeaturedCuentto {
  id: number;
  title: string;
  duration: number;
  createdAt: string;
  slug?: string | null;
  mood: {
    title: string;
    color: string;
  };
  user: {
    username: string;
    usernameSlug?: string | null;
    profileName: string;
    profilePicture?: string;
  };
}