⚡ Webhook Engine
A Stripe-like Webhook Delivery Platform Built From First Principles

Reliable. Observable. Replayable.
A production-grade webhook infrastructure inspired by Stripe, GitHub, and Slack.

🚀 What is Webhook Engine?

Webhook Engine is a backend platform that lets developers reliably deliver events to external systems using webhooks — exactly how real-world providers do it.

It is designed to answer one question deeply:

“How do companies like Stripe deliver millions of webhooks reliably?”

This project focuses on infrastructure correctness, not UI demos.

🎯 Why this exists

Most developers:

consume webhooks

rarely build webhook systems correctly

Real webhook systems must handle:

Retries & failures

Ordering

Idempotency

Dead-letter queues

Immutable logs

Infinite scale without DB bottlenecks

This project builds all of that from scratch, intentionally.

🧠 Core Principles

Postgres ≠ log storage

Workers must be stateless

Failures are first-class citizens

Everything must be replayable

Observability > convenience

🏗️ High-Level Architecture
┌────────────┐
│   Client   │
│ (Your App) │
└─────┬──────┘
      │  HTTP (Events)
      ▼
┌──────────────────────┐
│ Next.js API (App)    │
│ - Auth (API Keys)    │
│ - Event ingestion    │
│ - Idempotency checks │
└─────┬────────────────┘
      │
      ▼
┌──────────────────────┐
│ PostgreSQL           │
│ - Projects           │
│ - Events             │
│ - Webhooks           │
│ - Deliveries         │
│ - Attempts (metadata)│
└─────┬────────────────┘
      │
      ▼
┌──────────────────────┐
│ Redis (BullMQ)       │
│ - Delivery Queue     │
│ - Retry scheduling   │
│ - DLQ semantics      │
└─────┬────────────────┘
      │
      ▼
┌────────────────────────────┐
│ Worker Process             │
│ - Signs webhook payloads   │
│ - Sends HTTP requests      │
│ - Measures latency         │
│ - Handles retries & DLQ    │
│ - Uploads logs to S3       │
└─────┬──────────────────────┘
      │
      ▼
┌──────────────────────┐
│ Amazon S3            │
│ - Immutable JSON logs│
│ - One file per try   │
│ - Infinite retention │
└──────────────────────┘

✅ What’s Already Built
🔐 Project-based Authentication

Each project has a unique API key

Requests are authenticated at ingestion

Multi-tenant safe by design

📦 Event Ingestion Engine

Events stored idempotently

One event → many deliveries

Safe fan-out to webhooks

🔁 Reliable Delivery System

Powered by BullMQ

Retry with backoff

Attempt tracking

Per-delivery lifecycle

States:

PENDING → SUCCESS
        → FAILED → DEAD

✍️ Signed Webhook Requests

HMAC-based signatures

Timestamped payloads

Stripe-style verification model

Example header:

X-Signature: t=timestamp,v1=signature

🪵 Immutable Delivery Logs (S3)

Every webhook attempt generates one immutable JSON file.

Why S3 instead of Postgres?

No hot rows

Cheap storage

Infinite scale

Replay-safe

Audit-friendly

Structure

project_<projectId>/
  event_<eventId>/
    delivery_<deliveryId>/
      attempt_1.json
      attempt_2.json

🧨 Dead Letter Queue (DLQ)

Max attempts enforced

Failed deliveries marked DEAD

Replay-ready architecture

🧩 Data Model Philosophy
Layer	Responsibility
Postgres	Metadata, status, pointers
Redis	Scheduling & retries
S3	Source of truth (logs)
Worker	Execution & side-effects
🔮 Roadmap (Next Phases)
👤 User Authentication

Email/password auth

Secure cookie sessions

User → Project ownership

🧭 Developer Dashboard

Create & manage projects

View API keys

Register webhooks

Inspect delivery attempts

Replay failures

🔁 Replay System

Replay single attempts

Replay entire events

Replay from DEAD state

Idempotency-safe

📊 Observability

Latency histograms

Failure rates

Success ratios per webhook

Delivery timelines

☁️ Deployment & Infra

Dockerized services

Separate API & worker processes

Redis + Postgres

Production-ready layout

Domain optional (local-first)

🧠 Inspiration

Architectural inspiration from:

Stripe – webhook reliability & signing

GitHub – delivery logs & retries

Slack – event fan-out

AWS EventBridge – decoupled execution

🧪 Status

🚧 Actively being built
