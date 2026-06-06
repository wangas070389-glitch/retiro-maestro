-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'FREE',
    "role" TEXT NOT NULL DEFAULT 'USER',
    "subscriptionStatus" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "trialSimulationsUsed" INTEGER NOT NULL DEFAULT 0,
    "advisorId" TEXT,
    "agencyName" TEXT,
    "agencyPhone" TEXT,
    "agencyLogoUrl" TEXT,
    "magicLinkToken" TEXT,
    "magicLinkExpires" TIMESTAMP(3),
    "operationState" TEXT,
    "remoteReady" BOOLEAN NOT NULL DEFAULT false,
    "residencyState" TEXT,
    "leadStatus" TEXT NOT NULL DEFAULT 'NONE',
    "slaExpiresAt" TIMESTAMP(3),
    "claimedById" TEXT,
    "nss" TEXT,
    "birthDate" TIMESTAMP(3),
    "isWorking" BOOLEAN NOT NULL DEFAULT false,
    "age" INTEGER,
    "currentWeeks" INTEGER,
    "avgSalary" DOUBLE PRECISION,
    "lastBajaDate" TIMESTAMP(3),
    "activeStrategy" TEXT,
    "m40PaymentsState" TEXT,
    "currentStage" TEXT NOT NULL DEFAULT 'PROSPECT',
    "nextAction" TEXT,
    "nextActionAt" TIMESTAMP(3),
    "selectedStrategyId" TEXT,
    "closingNarrative" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "advisorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROSPECT',
    "nss" TEXT,
    "birthDate" TIMESTAMP(3),
    "isWorking" BOOLEAN NOT NULL DEFAULT false,
    "age" INTEGER,
    "currentWeeks" INTEGER,
    "avgSalary" DOUBLE PRECISION,
    "lastBajaDate" TIMESTAMP(3),
    "activeStrategy" TEXT,
    "m40PaymentsState" TEXT,
    "currentStage" TEXT NOT NULL DEFAULT 'PROSPECT',
    "nextAction" TEXT,
    "nextActionAt" TIMESTAMP(3),
    "selectedStrategyId" TEXT,
    "closingNarrative" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "clientId" TEXT,
    "name" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "result" TEXT,
    "integrity_hash" TEXT,
    "is_forensic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "investment" DOUBLE PRECISION NOT NULL,
    "netPension" DOUBLE PRECISION NOT NULL,
    "roiMonths" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomicAnchor" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "uma" DOUBLE PRECISION NOT NULL,
    "inpc" DOUBLE PRECISION NOT NULL,
    "smdf" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "signature" TEXT,
    "active_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EconomicAnchor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WageHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employer" TEXT NOT NULL,
    "movementDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "dailyWage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_magicLinkToken_key" ON "User"("magicLinkToken");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "EconomicAnchor_year_source_key" ON "EconomicAnchor"("year", "source");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WageHistory" ADD CONSTRAINT "WageHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
