import { DevData, JobData } from '../domain/types.js';

/**
 * Port pra carregar DevData/JobData a partir de IDs — usado quando o caller
 * tem apenas os IDs (ex: JobApplication.apply, MatchBatchConsumer pair).
 *
 * Adapter padrao: TypeOrmDevJobDataLoader (joins em dev_profiles, dev_skills,
 * experiences, jobs, job_skills).
 */
export interface DevJobDataLoader {
  loadDev(devProfileId: string): Promise<DevData | null>;
  loadJob(jobId: string): Promise<JobData | null>;
}
