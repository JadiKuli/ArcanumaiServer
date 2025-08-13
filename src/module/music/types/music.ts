export interface GenerateMusicPayload {
  custom_mode: boolean;
  prompt: string;
  mv: string;
  title?: string;
  tags?: string;
  negative_tags?: string;
  make_instrumental?: boolean;
  gpt_description_prompt?: string;
}

export interface MusicApiResponse {
  task_id: string;
  message: string;
}
