export interface Committee {
  id: string;
  code: string;
  name: string;
  reports_to: string;
  vacancies: string;
  dedication: string;
  why_exists: string;
  activities: string[];
  sort_order: number;
}