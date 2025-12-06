/*
Create the SQL schema for 3 tables, with constraints + indexes + relationships.
Tables:
1. leads
2. applications
3. tasks
Requirements:
• Every table must include: id, tenant_id, created_at, updated_at
• applications references leads(id)
• tasks references applications(id) (as related_id)
• Add proper FOREIGN KEY constraints
• Add indexing for common queries:
o fetch leads by owner, stage, created_at
o fetch applications by lead
o fetch tasks due today
• Add a constraint:
o tasks.due_at >= created_at
• Add a check constraint:
o task.type IN (‘call’, ‘email’, ‘review’)
Deliverable:
A single .sql file that we should be able to run in Supabase
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE
TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    team_id UUID REFERENCES teams (id) ON DELETE SET NULL,
    stage TEXT NOT NULL DEFAULT 'new',
    name TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID NOT NULL,
    lead_id UUID NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    tenant_id UUID NOT NULL,
    related_id UUID NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'call' | 'email' | 'review'
    status TEXT NOT NULL DEFAULT 'pending',
    due_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tasks_due_at_after_created_at CHECK (due_at >= created_at),
    CONSTRAINT tasks_type_check CHECK (
        type IN ('call', 'email', 'review')
    )
);

CREATE INDEX IF NOT EXISTS idx_leads_owner_stage_created_at ON leads (owner_id, stage, created_at);

CREATE INDEX IF NOT EXISTS idx_applications_lead_id ON applications (lead_id);

CREATE INDEX IF NOT EXISTS idx_tasks_tenant_due_at ON tasks (tenant_id, due_at);

/* ROW LEVEL SECURITY DECLARATION */

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselor only reads Leads assingned to him or his Team and Admin reads all" ON leads FOR
SELECT USING (
        (auth.jwt () ->> 'role') = 'admin'
        OR (
            (auth.jwt () ->> 'role') = 'counselor'
            AND (
                owner_id = auth.uid ()
                OR team_id IN (
                    SELECT user_teams.team_id
                    FROM user_teams
                    WHERE
                        user_teams.user_id = auth.uid ()
                )
            )
        )
    );

/* 
INSER FOR HIS TEAM
TO PREVENT BAD RESPONSE IN TEAM ID   
*/
CREATE POLICY "Counselor only inserts Leads for him in his Team and Admin inserts all" ON leads FOR
INSERT WITH CHECK (
        (auth.jwt () ->> 'role') = 'admin'
        OR (
            (auth.jwt () ->> 'role') = 'counselor'
            AND (
                owner_id = auth.uid ()
                AND
                (
                    team_id IS NULL
                    OR team_id IN (
                        SELECT user_teams.team_id
                        FROM user_teams
                        WHERE user_teams.user_id = auth.uid()
                    )
                )
            )
        )
    )


/* UPDATED AT TRIGGERS */

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leads_set_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_applications_set_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tasks_set_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();