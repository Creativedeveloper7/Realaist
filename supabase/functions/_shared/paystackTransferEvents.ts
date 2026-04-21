// Shared handler for Paystack transfer.* webhook events.
// Paystack sends these to the same dashboard webhook URL as charge.* (see docs/paystack/webhooks.md).

// deno-lint-ignore no-explicit-any
export async function applyPaystackTransferEventToHostTransfers(
  supabaseClient: any,
  event: { event: string; data?: Record<string, unknown> },
): Promise<void> {
  const ev = event.event;
  const data = event.data;
  const reference = data?.reference as string | undefined;

  if (!reference) {
    return;
  }

  if (ev === "transfer.success") {
    await supabaseClient
      .from("host_transfers")
      .update({
        status: "success",
        paystack_transfer_code: (data?.transfer_code as string) ?? undefined,
        failure_reason: null,
        metadata: { last_webhook: event },
      })
      .eq("transfer_reference", reference);
  } else if (ev === "transfer.failed" || ev === "transfer.reversed") {
    await supabaseClient
      .from("host_transfers")
      .update({
        status: "failed",
        failure_reason:
          (data?.failures as string) ||
          (data?.message as string) ||
          ev,
        metadata: { last_webhook: event },
      })
      .eq("transfer_reference", reference);
  }
}
