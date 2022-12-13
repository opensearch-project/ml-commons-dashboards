export interface RegisterModelFormData {
  name: string;
  version: number;
  description: string;
  annotations: string;
  modelFile: File;
  modelURL: string;
}
