<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-vue-next';
import {
  paymentService,
  isPaidCreditPlan,
  type CreditPlanResponse,
} from '@/app/shared/services/payment.service';

const route = useRoute();
const router = useRouter();

const balance = ref<number | null>(null);
const initialFreeCredits = ref<number | null>(null);
const plans = ref<CreditPlanResponse[]>([]);
const isLoadingBalance = ref(false);
const isLoadingPlans = ref(false);
const isProcessingPayment = ref(false);
const paymentSuccessDetails = ref<{ credits: number; txId: string | null } | null>(null);
const paymentCancelMessage = ref(false);
const errorMessage = ref('');
const activePlanLoading = ref<string | null>(null);
const captureOrderId = ref<string | null>(null);

const PENDING_PAYMENT_STORAGE_KEY = 'llanqui.pending-paypal-order';

interface PendingPayment {
  orderId: string;
  planCode: string;
  createdAt: number;
}

const freePlan = computed(() => plans.value.find((plan) => !plan.requiresPayment) ?? null);
const paidPlans = computed(() => plans.value.filter((plan) => plan.requiresPayment));

function savePendingPayment(payment: PendingPayment): void {
  try {
    sessionStorage.setItem(PENDING_PAYMENT_STORAGE_KEY, JSON.stringify(payment));
  } catch {
    // Payment confirmation remains valid without sessionStorage.
  }
}

function getPendingPayment(): PendingPayment | null {
  try {
    const rawPayment = sessionStorage.getItem(PENDING_PAYMENT_STORAGE_KEY);
    if (!rawPayment) return null;

    const payment = JSON.parse(rawPayment) as Partial<PendingPayment>;
    if (
      typeof payment.orderId !== 'string' ||
      typeof payment.planCode !== 'string' ||
      typeof payment.createdAt !== 'number'
    ) {
      return null;
    }

    return payment as PendingPayment;
  } catch {
    return null;
  }
}

function clearPendingPayment(): void {
  try {
    sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
  } catch {
    // Ignore storage restrictions; the API remains the source of truth.
  }
}

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${price.toFixed(2)} ${currency}`;
  }
}

async function fetchBalance(): Promise<void> {
  isLoadingBalance.value = true;
  try {
    const response = await paymentService.getBalance();
    balance.value = response.balance;
    initialFreeCredits.value = response.initialFreeCredits;
  } catch (error) {
    console.error('Error loading credit balance:', error);
    errorMessage.value = 'No se pudo consultar tu saldo de créditos. Inténtalo nuevamente.';
  } finally {
    isLoadingBalance.value = false;
  }
}

async function fetchPlans(): Promise<void> {
  isLoadingPlans.value = true;
  try {
    plans.value = await paymentService.getPlans();
  } catch (error) {
    console.error('Error loading payment plans:', error);
    errorMessage.value = 'No se pudieron cargar los planes disponibles.';
  } finally {
    isLoadingPlans.value = false;
  }
}

async function refreshPaymentData(clearError = true): Promise<void> {
  if (clearError) errorMessage.value = '';
  await Promise.all([fetchBalance(), fetchPlans()]);
}

async function buyPlan(plan: CreditPlanResponse): Promise<void> {
  if (!plan.requiresPayment) return;

  if (!isPaidCreditPlan(plan.code)) {
    errorMessage.value = 'Este plan no está habilitado para compras con PayPal.';
    return;
  }

  activePlanLoading.value = plan.code;
  errorMessage.value = '';
  paymentCancelMessage.value = false;
  const currentUrl = window.location.origin + window.location.pathname;
  const returnUrl = `${currentUrl}?tab=payments&status=success`;
  const cancelUrl = `${currentUrl}?tab=payments&status=cancel`;

  try {
    const response = await paymentService.createOrder({
      creditPlan: plan.code,
      platform: 'Paypal',
      returnUrl,
      cancelUrl,
    });

    let approvalUrl: URL | null = null;
    try {
      approvalUrl = new URL(response.approvalUrl);
    } catch {
      // The backend contract requires an absolute PayPal approval URL.
    }

    if (!response.orderId?.trim()) {
      errorMessage.value = 'PayPal no devolvió un identificador de orden válido.';
      return;
    }

    if (!approvalUrl || !['http:', 'https:'].includes(approvalUrl.protocol)) {
      errorMessage.value = 'PayPal no devolvió un enlace de pago para esta compra.';
      return;
    }

    savePendingPayment({
      orderId: response.orderId,
      planCode: plan.code,
      createdAt: Date.now(),
    });
    window.location.assign(approvalUrl.toString());
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    errorMessage.value = 'No se pudo iniciar el pago con PayPal. Verifica tu sesión e inténtalo nuevamente.';
  } finally {
    activePlanLoading.value = null;
  }
}

async function capturePayment(orderId: string): Promise<void> {
  captureOrderId.value = orderId;
  isProcessingPayment.value = true;
  errorMessage.value = '';

  try {
    const pendingPayment = getPendingPayment();
    if (pendingPayment && pendingPayment.orderId !== orderId) {
      throw new Error('La orden retornada por PayPal no coincide con la compra iniciada.');
    }

    const response = await paymentService.captureOrder(orderId);
    if (!response.success) {
      throw new Error('PayPal procesó la orden, pero no fue posible acreditar los créditos.');
    }

    // Use the capture response immediately, then confirm the canonical balance
    // with the backend before closing the callback state.
    balance.value = response.newBalance;
    paymentSuccessDetails.value = {
      credits: response.creditsAdded,
      txId: response.transactionId,
    };
    clearPendingPayment();
    captureOrderId.value = null;
    await fetchBalance();
    await router.replace({ query: { ...route.query, status: undefined, token: undefined } });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    errorMessage.value = error instanceof Error && error.message.includes('no coincide')
      ? error.message
      : error instanceof Error && error.message.includes('no fue posible')
        ? error.message
        : 'No se pudo confirmar la orden de PayPal. Puedes reintentarlo desde esta pantalla.';
  } finally {
    isProcessingPayment.value = false;
  }
}

async function retryPaymentCapture(): Promise<void> {
  if (captureOrderId.value) {
    await capturePayment(captureOrderId.value);
  }
}

async function handlePaymentCallback(): Promise<void> {
  const status = route.query.status as string | undefined;
  const token = route.query.token as string | undefined;

  if (status === 'success' && token) {
    await capturePayment(token);
  } else if (status === 'cancel') {
    clearPendingPayment();
    paymentCancelMessage.value = true;
    await router.replace({ query: { ...route.query, status: undefined, token: undefined } });
  } else if (status === 'success') {
    errorMessage.value = '';
    clearPendingPayment();
    errorMessage.value = 'PayPal regresó sin un identificador de orden. No se realizó la confirmación.';
    await router.replace({ query: { ...route.query, status: undefined, token: undefined } });
  }
}

onMounted(async () => {
  await handlePaymentCallback();
  await refreshPaymentData(false);
});
</script>

<template>
  <section class="payments-settings" aria-labelledby="payments-title">
    <Teleport to="body">
      <div v-if="isProcessingPayment" class="overlay-modal" role="status" aria-live="polite">
        <div class="modal-content">
          <Loader2 class="spinner-loader text-primary" :size="42" aria-hidden="true" />
          <h2>Confirmando tu pago</h2>
          <p>Estamos verificando la orden con PayPal y acreditando tus créditos. No cierres esta ventana.</p>
        </div>
      </div>

      <Transition name="slide-down">
        <div v-if="paymentSuccessDetails" class="toast success-toast" role="status" @click="paymentSuccessDetails = null">
          <CheckCircle2 :size="18" aria-hidden="true" />
          <div>
            <strong>Créditos acreditados: +{{ paymentSuccessDetails.credits }}</strong>
            <small v-if="paymentSuccessDetails.txId">Transacción: {{ paymentSuccessDetails.txId }}</small>
          </div>
        </div>
      </Transition>

      <Transition name="slide-down">
        <div v-if="paymentCancelMessage" class="toast notice-toast" role="status" @click="paymentCancelMessage = false">
          <AlertCircle :size="18" aria-hidden="true" />
          <span>Cancelaste la compra. No se realizó ningún cargo.</span>
        </div>
      </Transition>

      <Transition name="slide-down">
        <div v-if="errorMessage" class="toast error-toast" role="alert" @click="errorMessage = ''">
          <AlertCircle :size="18" aria-hidden="true" />
          <span class="toast-message">{{ errorMessage }}</span>
          <button v-if="captureOrderId" type="button" class="toast-action" @click.stop="retryPaymentCapture">
            Reintentar
          </button>
        </div>
      </Transition>
    </Teleport>

    <header class="payments-header">
      <span class="heading-icon" aria-hidden="true"><Sparkles :size="21" /></span>
      <div>
        <p class="eyebrow">CRÉDITOS DE IA</p>
        <h1 id="payments-title">Genera CV con el plan que necesitas</h1>
        <p>Tu saldo, precios y paquetes se consultan directamente desde Llanqui. PayPal solo se usa para los paquetes pagados.</p>
      </div>
    </header>

    <section class="balance-card" aria-label="Saldo actual de créditos">
      <div class="balance-copy">
        <span>Saldo disponible</span>
        <strong v-if="!isLoadingBalance && balance !== null">{{ balance }}</strong>
        <strong v-else aria-live="polite">—</strong>
        <p>Cada generación o mejora con IA consume 1 crédito.</p>
      </div>
      <button type="button" class="refresh-button" :disabled="isLoadingBalance || isLoadingPlans" @click="refreshPaymentData()">
        <RefreshCw :size="16" :class="{ 'spinner-loader': isLoadingBalance || isLoadingPlans }" aria-hidden="true" />
        Actualizar
      </button>
    </section>

    <section v-if="freePlan" class="free-plan-card" aria-labelledby="free-plan-title">
      <div>
        <span class="included-label">INCLUIDO</span>
        <h2 id="free-plan-title">Plan {{ freePlan.name }}</h2>
        <p>{{ freePlan.description }}</p>
      </div>
      <div class="free-credit-summary">
        <strong>{{ freePlan.credits }}</strong>
        <span>créditos iniciales</span>
        <small v-if="initialFreeCredits !== null">Asignación inicial: {{ initialFreeCredits }}</small>
      </div>
    </section>

    <section class="plans-section" aria-labelledby="paid-plans-title">
      <div class="plans-heading">
        <div>
          <h2 id="paid-plans-title">Paquetes para continuar</h2>
          <p>Compra créditos solo cuando los necesites. No son suscripciones recurrentes.</p>
        </div>
      </div>

      <div v-if="isLoadingPlans" class="plans-grid plans-grid--loading" aria-live="polite" aria-busy="true">
        <article v-for="slot in 3" :key="slot" class="plan-card plan-card--skeleton" aria-hidden="true">
          <span class="skeleton-line skeleton-line--short"></span>
          <span class="skeleton-line"></span>
          <span class="skeleton-line skeleton-line--long"></span>
          <span class="skeleton-price"></span>
          <span class="skeleton-button"></span>
        </article>
      </div>
      <p v-else-if="!paidPlans.length" class="loading-copy">No hay paquetes disponibles en este momento.</p>

      <div v-else class="plans-grid">
        <article v-for="plan in paidPlans" :key="plan.code" class="plan-card">
          <div class="plan-topline">
            <span class="plan-code">{{ plan.name }}</span>
          </div>
          <p class="plan-description">{{ plan.description }}</p>
          <div class="price-row">
            <strong>{{ formatPrice(plan.price, plan.currency) }}</strong>
            <span>{{ plan.currency }} · pago único</span>
          </div>
          <div class="credit-row">
            <Check :size="16" aria-hidden="true" />
            <span>{{ plan.credits }} créditos de IA</span>
          </div>
          <button
            type="button"
            class="buy-button"
            :disabled="activePlanLoading !== null"
            @click="buyPlan(plan)"
          >
            <Loader2 v-if="activePlanLoading === plan.code" class="spinner-loader" :size="17" aria-hidden="true" />
            <CreditCard v-else :size="17" aria-hidden="true" />
            {{ activePlanLoading === plan.code ? 'Conectando con PayPal…' : 'Comprar con PayPal' }}
          </button>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.payments-settings { display: grid; gap: clamp(18px, 3vw, 28px); width: 100%; }
.payments-header { display: flex; gap: 14px; align-items: flex-start; max-width: 760px; }
.heading-icon { display: grid; flex: 0 0 auto; place-items: center; width: 44px; height: 44px; color: var(--color-primary); background: rgba(185, 239, 74, .28); border-radius: 14px; }
.eyebrow, .included-label, .plan-code { margin: 0 0 5px; color: var(--color-primary); font-size: 11px; font-weight: var(--fw-bold); letter-spacing: .08em; text-transform: uppercase; }
.payments-header h1, .plans-heading h2, .free-plan-card h2 { margin: 0; color: var(--color-text-primary); font-size: clamp(22px, 4vw, 28px); font-weight: var(--fw-bold); line-height: 1.15; }
.payments-header p:last-child, .plans-heading p, .free-plan-card p, .balance-copy p, .plan-description { margin: 7px 0 0; color: var(--color-text-secondary); font-size: 14px; line-height: 1.5; }
.balance-card, .free-plan-card, .plan-card { border: 1px solid var(--color-border); border-radius: var(--radius-card); box-shadow: var(--shadow-card); }
.balance-card { display: flex; justify-content: space-between; gap: 20px; align-items: center; padding: clamp(18px, 3vw, 24px); border-color: rgba(40, 56, 211, .2); background: linear-gradient(135deg, rgba(40, 56, 211, .08), rgba(185, 239, 74, .12)); }
.balance-copy { display: grid; gap: 3px; }
.balance-copy > span { color: var(--color-text-secondary); font-size: 13px; font-weight: var(--fw-semibold); }
.balance-copy strong { color: var(--color-primary); font-size: clamp(34px, 6vw, 46px); font-weight: var(--fw-bold); line-height: 1; }
.balance-copy p { font-size: 12px; }
.refresh-button, .buy-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 46px; border-radius: var(--radius-button); font: inherit; font-size: 14px; font-weight: var(--fw-bold); cursor: pointer; transition: var(--transition); }
.refresh-button { flex: 0 0 auto; padding: 0 16px; color: var(--color-primary); background: var(--color-surface); border: 1px solid rgba(40, 56, 211, .24); }
.refresh-button:hover:not(:disabled) { border-color: var(--color-primary); background: #fff; }
.free-plan-card { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: clamp(18px, 3vw, 24px); background: var(--color-surface); border-color: rgba(185, 239, 74, .8); }
.free-plan-card h2 { font-size: 20px; }
.included-label { display: inline-flex; padding: 4px 8px; border-radius: 999px; color: #355800; background: var(--color-brand-lime); }
.free-credit-summary { display: grid; min-width: 130px; text-align: right; }
.free-credit-summary strong { color: var(--color-primary); font-size: 32px; line-height: 1; }
.free-credit-summary span, .free-credit-summary small { color: var(--color-text-secondary); font-size: 12px; }
.free-credit-summary small { margin-top: 6px; }
.plans-section { display: grid; gap: 16px; }
.plans-heading h2 { font-size: 20px; }
.plans-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.plan-card { display: grid; gap: 14px; padding: 20px; background: var(--color-surface); }
.plan-card--skeleton { min-height: 270px; pointer-events: none; }
.skeleton-line, .skeleton-price, .skeleton-button { display: block; border-radius: 8px; background: linear-gradient(90deg, var(--color-surface-subtle), #e9edfa, var(--color-surface-subtle)); background-size: 220% 100%; animation: skeleton-shimmer 1.25s ease-in-out infinite; }
.skeleton-line { width: 72%; height: 14px; }
.skeleton-line--short { width: 38%; height: 18px; }
.skeleton-line--long { width: 92%; height: 42px; }
.skeleton-price { width: 48%; height: 34px; margin-top: 6px; }
.skeleton-button { width: 100%; height: 46px; margin-top: auto; }
.plan-topline { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.plan-code { margin: 0; font-size: 15px; }
.plan-description { min-height: 63px; font-size: 13px; }
.price-row { display: grid; gap: 3px; padding-top: 4px; }
.price-row strong { color: var(--color-text-primary); font-size: 28px; }
.price-row span { color: var(--color-text-muted); font-size: 12px; }
.credit-row { display: flex; gap: 8px; align-items: center; color: var(--color-text-primary); font-size: 13px; font-weight: var(--fw-semibold); }
.credit-row svg { color: #5a8d00; }
.buy-button { width: 100%; margin-top: auto; padding: 0 14px; color: var(--color-primary); background: var(--color-surface); border: 1px solid rgba(40, 56, 211, .3); }
.buy-button:hover:not(:disabled) { color: #fff; background: var(--color-primary); border-color: var(--color-primary); }
.refresh-button:disabled, .buy-button:disabled { opacity: .62; cursor: wait; }
.refresh-button:focus-visible, .buy-button:focus-visible { outline: 3px solid rgba(185, 239, 74, .9); outline-offset: 3px; }
.loading-copy { margin: 0; color: var(--color-text-secondary); font-size: 14px; }
.overlay-modal { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 20px; background: rgba(8, 14, 46, .64); }
.modal-content { display: grid; justify-items: center; gap: 12px; max-width: 400px; padding: 28px; color: var(--color-text-primary); text-align: center; background: var(--color-surface); border-radius: var(--radius-card); box-shadow: 0 20px 60px rgba(0, 0, 0, .3); }
.modal-content h2, .modal-content p { margin: 0; }.modal-content h2 { font-size: 19px; }.modal-content p { color: var(--color-text-secondary); font-size: 14px; line-height: 1.5; }
.toast { position: fixed; top: max(86px, calc(70px + env(safe-area-inset-top, 0px) + 16px)); right: 24px; z-index: 99999; display: flex; gap: 12px; align-items: flex-start; max-width: min(440px, calc(100vw - 32px)); padding: 14px 18px; color: #fff; border-radius: 12px; box-shadow: 0 14px 36px rgba(21, 32, 59, 0.22); font-family: var(--font-family); font-size: 14px; line-height: 1.4; cursor: pointer; box-sizing: border-box; }
.toast strong, .toast small { display: block; }.toast small { margin-top: 3px; opacity: .88; font-size: 11px; }.toast-message { min-width: 0; }.toast-action { min-height: 32px; padding: 0 10px; color: #fff; background: transparent; border: 1px solid rgba(255, 255, 255, .7); border-radius: 8px; font: inherit; font-size: 12px; font-weight: var(--fw-bold); cursor: pointer; white-space: nowrap; }.toast-action:hover { background: rgba(255, 255, 255, .14); }.success-toast { background: #24751d; cursor: pointer; }.notice-toast { color: #4d3e00; background: #f5dc73; }.error-toast { background: #b92c38; }.text-primary { color: var(--color-primary); }
.spinner-loader { animation: spin .85s linear infinite; }
.slide-down-enter-active, .slide-down-leave-active { transition: opacity .2s ease, transform .2s ease; }.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes skeleton-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
@media (max-width: 860px) { .plans-grid { grid-template-columns: 1fr; max-width: 540px; }.plan-description { min-height: 0; } }
@media (max-width: 560px) { .balance-card, .free-plan-card { align-items: flex-start; flex-direction: column; }.refresh-button { width: 100%; }.free-credit-summary { text-align: left; }.toast { top: max(80px, calc(70px + env(safe-area-inset-top, 0px) + 10px)); right: 16px; left: 16px; max-width: none; }.payments-header { gap: 10px; } }
@media (prefers-reduced-motion: reduce) { .spinner-loader, .skeleton-line, .skeleton-price, .skeleton-button { animation: none; }.slide-down-enter-active, .slide-down-leave-active { transition: none; } }
</style>
