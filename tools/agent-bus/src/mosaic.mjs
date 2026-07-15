import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export class MosaicNotifier {
  constructor({ enabled, binary, cooldownMs = 3000 } = {}) {
    this.enabled = enabled ?? process.env.JURIAI_MOSAIC_WAKE === "1";
    this.binary =
      binary ??
      process.env.JURIAI_MOSAIC_BIN ??
      process.env.MOSAIC_BUNDLED_CLI_PATH ??
      "mosaic";
    this.cooldownMs = cooldownMs;
    this.lastNotification = new Map();
  }

  async wake(agent, reason) {
    if (!this.enabled) return { sent: false, reason: "wake_disabled_globally" };
    if (!agent?.wakeEnabled) return { sent: false, reason: "wake_disabled_for_agent" };
    if (!agent.surfaceId) return { sent: false, reason: "missing_surface_id" };
    if (!["idle", "waiting"].includes(agent.status)) {
      return { sent: false, reason: `agent_${agent.status}` };
    }

    const previous = this.lastNotification.get(agent.agentId) ?? 0;
    if (Date.now() - previous < this.cooldownMs) {
      return { sent: false, reason: "cooldown" };
    }

    const text = `[JuriAI Agent Bus] ${reason}. Consulte sua caixa com read_inbox({ agentId: "${agent.agentId}" }).`;
    try {
      await execFileAsync(this.binary, ["send", "--surface", agent.surfaceId, text], {
        timeout: 5000,
      });
      await execFileAsync(this.binary, ["send-key", "--surface", agent.surfaceId, "enter"], {
        timeout: 5000,
      });
      this.lastNotification.set(agent.agentId, Date.now());
      return { sent: true };
    } catch (error) {
      return {
        sent: false,
        reason: "mosaic_cli_error",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
