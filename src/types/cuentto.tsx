export interface Cuentto {
  id: number;
  title: string;
  description: string;
  duration: number;
  createdAt: string;
  publicLink?: string | null;
  mood: {
    title: string;
    color: string;
  };
  user: {
    username: string;
    profileName: string;
    profilePicture?: string;
  };
    music: {
    id: number;
    name: string;
    musicFile: number;
  };
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