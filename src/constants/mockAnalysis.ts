export type EvidenceStrength = 'weak' | 'moderate' | 'strong';

export type CapabilityStatus =
  | 'strong'
  | 'developing'
  | 'insufficient';

export type ConvergenceStatus =
  | 'converging'
  | 'conflict'
  | 'inconclusive';

export const mockAnalysis = {
  analysis_id: 'demo-analysis-001',

  overall_status: 'developing' as CapabilityStatus,

  summary:
    'Several capabilities are supported by evidence, but important gaps remain before stronger conclusions.',

  capabilities: [
    {
      name: 'Containerization (Docker)',

      claim: 'Uses Docker for local development of services.',

      status: 'insufficient' as CapabilityStatus,

      supportedBy: [
        {
          source: 'resume',
          strength: 'weak' as EvidenceStrength,
          detail:
            'Docker listed under skills; no configuration artifacts described.',
        },
      ],

      convergence: {
        status: 'converging' as ConvergenceStatus,
        summary:
          'Single weak resume mention; no conflicting sources.',
      },

      unknowns: [
        'Ability to author multi-stage Dockerfiles',
        'Docker Compose multi-service setup',
        'Production-oriented recovery reasoning',
      ],

      evidenceGap: {
        title: 'Production container reasoning',

        description:
          'No evidence of Dockerfile/Compose design or failure recovery under realistic conditions.',

        why_it_matters:
          'Backend roles expect reliable container setup and operational judgment, not only tool names.',
      },

      nextEvidence: {
        task_title: 'Production failure scenario',

        task_prompt:
          'A container restarts repeatedly in production. Explain how you would isolate, diagnose, and recover it.',
      },
    },

    {
      name: 'REST API & Spring Boot',

      claim:
        'Builds REST APIs and backends with Java and Spring Boot.',

      status: 'developing' as CapabilityStatus,

      supportedBy: [
        {
          source: 'resume',
          strength: 'moderate' as EvidenceStrength,
          detail:
            'Resume describes REST APIs and an e-commerce backend using Spring Boot.',
        },
      ],

      convergence: {
        status: 'converging' as ConvergenceStatus,
        summary:
          'Skills and project language align on Spring Boot APIs.',
      },

      unknowns: [
        'Error handling and validation depth',
        'Auth patterns (JWT/OAuth)',
        'Test coverage approach',
      ],

      evidenceGap: {
        title: 'API design depth',

        description:
          'Claims exist, but architectural and quality practices are not evidenced.',

        why_it_matters:
          'Strong API work shows structure, safety, and maintainability—not only endpoints.',
      },

      nextEvidence: {
        task_title: 'API design challenge',

        task_prompt:
          'Design a small REST endpoint with validation, error handling, and one unit-test idea.',
      },
    },

    {
      name: 'Database & SQL',

      claim:
        'Works with SQL and PostgreSQL for backend storage.',

      status: 'developing' as CapabilityStatus,

      supportedBy: [
        {
          source: 'resume',
          strength: 'weak' as EvidenceStrength,
          detail:
            'SQL/PostgreSQL listed; project mentions data storage without schema detail.',
        },
      ],

      convergence: {
        status: 'converging' as ConvergenceStatus,
        summary:
          'Consistent but thin mentions of relational data use.',
      },

      unknowns: [
        'Schema design and normalization',
        'Indexing / query performance awareness',
      ],

      evidenceGap: {
        title: 'Schema & query evidence',

        description:
          'No schema, migrations, or non-trivial query examples.',

        why_it_matters:
          'Backend reliability depends on data modeling and query judgment.',
      },

      nextEvidence: {
        task_title: 'Schema design task',

        task_prompt:
          'Sketch a simple e-commerce schema (tables + keys) and one reporting query idea.',
      },
    },
  ],
};