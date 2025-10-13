# Stripe Webhook Playbook

All webhook endpoints should verify `Stripe-Signature` using `STRIPE_WEBHOOK_SECRET` and support idempotency via event IDs.

| Event | Payload highlights | Handler responsibility | Notes |
| --- | --- | --- | --- |
| `payment_intent.created` | `amount`, `metadata.mission_id`, `customer` | Store intent + escrow state in `transactions` table (status `pending`). | Triggered when employer funds a mission. |
| `payment_intent.succeeded` | `charges.data[0].balance_transaction`, `metadata.runner_id` | Mark escrow as `completed`, credit runner wallet balance, enqueue notification. | Release funds to runner after completion confirmation. |
| `payment_intent.canceled` | `cancellation_reason`, `metadata.mission_id` | Update mission status to `cancelled`, refund employer, notify both parties. | Keep audit trail for disputes. |
| `transfer.created` | `amount`, `destination`, `metadata.mission_id` | Persist payout record, update wallet history. | Only applicable when using Stripe Connect. |
| `transfer.failed` | `failure_reason`, `destination_payment` | Flag payout issue, freeze wallet, alert support. | Require manual resolution. |
| `charge.dispute.created` | `amount`, `reason`, `evidence_details` | Lock related mission, create dispute task for ops/admin dashboard. | Preserve message history for review. |
| `customer.subscription.updated` | `status`, `items`, `metadata.account_id` | (Future) Manage premium plans for employers if subscriptions are added. | Optional extension. |

## Implementation checklist

1. Use a dedicated endpoint, e.g. `POST /webhooks/stripe`, deployed behind a secret path and IP filtering where possible.
2. Replay protection: store incoming event IDs in a table (`webhook_events`) and ignore duplicates.
3. Wrap side effects in a transaction: update mission/transaction rows, insert notifications, enqueue emails.
4. Emit structured logs (mission ID, user IDs, Stripe object IDs) to ease debugging.
5. For test mode, map sample missions to Stripe test customers using metadata to avoid mismatches.
