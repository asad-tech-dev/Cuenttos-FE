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

export interface FeaturedCuentto {
  id: number;
  title: string;
  duration: number;
  createdAt: string;
  mood: {
    title: string;
    color: string;
  };
  user: {
    username: string;
    profileName: string;
    profilePicture?: string;
  };
}