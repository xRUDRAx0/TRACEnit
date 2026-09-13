import { DbService, ExecutionRun, StepResult } from './db.service';
import { chromium, Browser, Page } from 'playwright';
import { Server } from 'socket.io';
import { RecoveryAgent } from './ai/recovery.agent';

interface RunContext {
  browser?: Browser;
  page?: Page;
}

export class ExecutionService {
  private activeRuns = new Map<string, RunContext>();

  constructor(private dbService: DbService, private io?: Server) {}

  async startExecution(automationId: string, context: Record<string, any> = {}): Promise<string> {
    const plan = await this.dbService.getAutomationById(automationId);
    if (!plan) throw new Error('Automation not found');

    const runId = 'run_' + Date.now();
    
    // Inject parameters into step targets/values where applicable
    const stepResults: StepResult[] = plan.steps.map(s => {
      let target = s.target;
      let value = s.value;
      
      // Simple variable substitution (e.g., {{invoice_amount}} or $invoice_amount)
      for (const [k, v] of Object.entries(context)) {
        if (target && typeof target === 'string') target = target.replace(new RegExp(`{{${k}}}|\\$${k}`, 'g'), v);
        if (value && typeof value === 'string') value = value.replace(new RegExp(`{{${k}}}|\\$${k}`, 'g'), v);
      }
      
      return {
        step: s.action || s.type,
        status: 'Pending',
        originalAction: s.originalAction,
        ...s,
        target,
        value
      };
    });

    const run: ExecutionRun = {
      runId,
      automationId,
      status: 'Running',
      currentStepIndex: 0,
      stepResults,
      context,
      startedAt: Date.now()
    };

    await this.dbService.saveExecutionRun(run);
    
    this.activeRuns.set(runId, {});
    
    this.runLoop(runId);
    return runId;
  }

  async resumeExecution(runId: string): Promise<void> {
    const run = await this.dbService.getExecutionRun(runId);
    if (!run || run.status !== 'WaitingForApproval') throw new Error('Run not waiting for approval');
    
    if (run.stepResults[run.currentStepIndex]) {
      run.stepResults[run.currentStepIndex].status = 'Completed';
    }
    run.currentStepIndex++;
    run.status = 'Running';
    await this.dbService.saveExecutionRun(run);
    this.runLoop(runId);
  }

  async cancelExecution(runId: string): Promise<void> {
    const run = await this.dbService.getExecutionRun(runId);
    if (!run) throw new Error('Run not found');
    
    if (run.stepResults[run.currentStepIndex]) {
      run.stepResults[run.currentStepIndex].status = 'Failed';
    }
    run.status = 'Failed';
    await this.dbService.saveExecutionRun(run);
    
    const runCtx = this.activeRuns.get(runId);
    if (runCtx?.browser) {
       await runCtx.browser.close().catch(() => {});
    }
  }

  private async runLoop(runId: string) {
    let run = await this.dbService.getExecutionRun(runId);
    if (!run) return;

    const runCtx = this.activeRuns.get(runId) || {};
    this.activeRuns.set(runId, runCtx);

    try {
      while (run && run.status === 'Running' && run.currentStepIndex < run.stepResults.length) {
        // Always work from the freshly fetched run to avoid stale reference issues
        const stepIndex = run.currentStepIndex;
        const currentStep = run.stepResults[stepIndex];
        if (!currentStep) break;
        const action = (currentStep as any).action || currentStep.step;
        
        currentStep.status = 'Running';
        await this.dbService.saveExecutionRun(run);
        this.io?.emit('run_update', { runId, status: run.status, stepIndex: run.currentStepIndex });
        
        // Wait briefly for UI visual updates
        await new Promise(res => setTimeout(res, 1500));

        // Re-fetch run to ensure we have the latest state (not cancelled externally)
        run = await this.dbService.getExecutionRun(runId) as ExecutionRun;
        if (!run || run.status !== 'Running') break;

        // Re-get step from freshly fetched run to avoid stale reference
        const freshStep = run.stepResults[stepIndex];
        if (!freshStep) break;

        try {
          // Auto-initialize browser if needed for any browser action
          if (!runCtx.browser && ['OPEN_BROWSER', 'NAVIGATE_URL', 'CLICK', 'TYPE'].includes(action)) {
            const isHeadless = process.env.PLAYWRIGHT_HEADLESS !== undefined
              ? process.env.PLAYWRIGHT_HEADLESS === 'true'
              : process.env.NODE_ENV === 'production';

            runCtx.browser = await chromium.launch({
              headless: isHeadless,
              args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            runCtx.page = await runCtx.browser.newPage();
            if (action !== 'OPEN_BROWSER' && action !== 'NAVIGATE_URL') {
              await runCtx.page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' }).catch(e => console.warn("Fallback nav failed", e));
            }
          }

          if (action === 'OPEN_BROWSER') {
            let url = (freshStep as any).url;
            if (url && runCtx.page) {
              if (!url.startsWith('http')) url = 'https://' + url;
              await runCtx.page.goto(url, { waitUntil: 'domcontentloaded' }).catch(e => console.warn("Nav failed", e));
            }
          }
          else if (action === 'OPEN_TAB') {
            if (runCtx.browser) runCtx.page = await runCtx.browser.newPage();
          }
          else if (action === 'NAVIGATE_URL') {
            let url = (freshStep as any).url;
            if (url && runCtx.page) {
              if (!url.startsWith('http')) url = 'https://' + url;
              await runCtx.page.goto(url, { waitUntil: 'domcontentloaded' });
            }
            else throw new Error("URL or Page not available");
          }
          else if (action === 'CLICK') {
            const target = (freshStep as any).target;
            const x = (freshStep as any).x || (freshStep as any).metadata?.x;
            const y = (freshStep as any).y || (freshStep as any).metadata?.y;
            if (target && runCtx.page) {
              // Try selector-based click first
              const element = runCtx.page.getByRole('button', { name: target, exact: false }).first()
                .or(runCtx.page.getByRole('link', { name: target, exact: false }).first())
                .or(runCtx.page.getByText(target, { exact: false }).first())
                .or(runCtx.page.locator(`text=${target}`).first());
              await element.click({ timeout: 5000 });
            } else if (x && y && runCtx.page) {
              await runCtx.page.mouse.click(Number(x), Number(y));
            } else {
              console.log("CLICK step has no target/coords, marking complete without browser action");
            }
          }
          else if (action === 'TYPE') {
            const target = (freshStep as any).target;
            const value = (freshStep as any).value;
            if (target && value && runCtx.page) {
              const element = runCtx.page.getByRole('textbox', { name: target, exact: false }).first()
                .or(runCtx.page.getByRole('searchbox', { name: target, exact: false }).first())
                .or(runCtx.page.locator(`text=${target}`).first())
                .or(runCtx.page.locator(target).first());
              await element.fill(value, { timeout: 5000 });
            } else if (value && runCtx.page) {
               await runCtx.page.keyboard.type(value);
            } else {
               console.log("TYPE step has no target/value, marking complete without browser action");
            }
          }
          else if (action === 'KEY_PRESS') {
             const key = (freshStep as any).key;
             if (key && runCtx.page) {
               let playwrightKey = key;
               if (key.toUpperCase() === 'ENTER') playwrightKey = 'Enter';
               await runCtx.page.keyboard.press(playwrightKey);
             }
          }
          else if (action === 'human_approval' || freshStep.step === 'human_approval') {
            freshStep.status = 'WaitingForApproval';
            run.status = 'WaitingForApproval';
            await this.dbService.saveExecutionRun(run);
            break; // Pause loop until user approves
          }
          else {
             console.log("Unknown action, skipping:", action);
          }

          if ((freshStep.status as string) !== 'WaitingForApproval') {
            freshStep.status = 'Completed';
            run.currentStepIndex++;
            
            if (run.currentStepIndex >= run.stepResults.length) {
              run.status = 'Completed';
              run.completedAt = Date.now();
            }
            await this.dbService.saveExecutionRun(run);
            this.io?.emit('run_update', { runId, status: run.status, stepIndex: run.currentStepIndex });
          }
        } catch (stepError: any) {
          console.warn("Step Failed, attempting self-healing:", stepError.message);
          run.status = 'Recovering';
          freshStep.status = 'Recovering';
          await this.dbService.saveExecutionRun(run);
          this.io?.emit('run_update', { runId, status: 'Recovering', stepIndex: run.currentStepIndex });
          
          let recovered = false;
          if (runCtx.page) {
             try {
                // Get available interactive elements on page
                const availableElements = await runCtx.page.evaluate(() => {
                  return Array.from(document.querySelectorAll('button, a, input, [role="button"], label'))
                       .map(e => (e.textContent?.trim() || (e as HTMLInputElement).value || (e as HTMLInputElement).placeholder || ''))
                       .filter(t => t.length > 0);
                });
                
                const url = runCtx.page.url();
                const target = (freshStep as any).target;
                
                if (target) {
                   const recoveryAgent = new RecoveryAgent();
                   const recoveryResult = await recoveryAgent.attemptRecovery(action, target, availableElements, url);
                   
                   if (recoveryResult.recovered && recoveryResult.newTarget) {
                      console.log("Self-healing successful! New target:", recoveryResult.newTarget);
                      (freshStep as any).target = recoveryResult.newTarget;
                      (freshStep as any).recoveryReason = recoveryResult.reason;
                      
                      // Wait briefly, then re-run the loop (it won't increment index, so it tries the SAME step again)
                      run.status = 'Running';
                      freshStep.status = 'Running';
                      await this.dbService.saveExecutionRun(run);
                      this.io?.emit('run_update', { runId, status: 'Running', stepIndex: run.currentStepIndex });
                      recovered = true;
                      await new Promise(r => setTimeout(r, 2000));
                   }
                }
             } catch (recoveryErr) {
                console.error("Recovery process failed:", recoveryErr);
             }
          }

          if (!recovered) {
            freshStep.status = 'Failed';
            run.status = 'Failed';
            run.context = run.context || {};
            run.context.errorDetails = stepError.message || 'Unknown error';
            await this.dbService.saveExecutionRun(run);
            this.io?.emit('run_update', { runId, status: 'Failed', stepIndex: run.currentStepIndex });
            break;
          }
        }
      }
    } catch (fatalError) {
       console.error("Fatal run error:", fatalError);
    }
  }
}
