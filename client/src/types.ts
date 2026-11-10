export interface ProfileDraft {
  firstName: string;
  username: string;
  service: string;
  candidates: string[];
}

export interface Profile extends Omit<ProfileDraft, 'candidates'> {
  id: string;
  picture: string;
  variant: number;
  comments: string;
}

export type Page = 'login' | 'create' | 'picture' | 'profiles' | 'detail';
