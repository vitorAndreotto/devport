/**
 * Port para checar se o dev tem candidatura ativa numa vaga aberta.
 * Usado pra decidir relevancia (par e relevante se score >= threshold OU
 * dev candidato com vaga aberta).
 *
 * Adapter padrao: TypeOrmApplicationStatusReader (joins job_applications + jobs).
 */
export interface ApplicationStatusReader {
  /** Dev tem candidatura E vaga esta aberta (status='open'). */
  hasActiveApplication(devProfileId: string, jobId: string): Promise<boolean>;
  /** Bulk version — retorna o subset dos jobIds que satisfazem a condicao. */
  filterActiveApplications(devProfileId: string, jobIds: string[]): Promise<Set<string>>;
}
