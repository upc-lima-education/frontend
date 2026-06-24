<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Sparkle, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Loader2, 
  RefreshCw, 
  DollarSign, 
  Check 
} from 'lucide-vue-next';
import { paymentService } from '@/app/shared/services/payment.service';

const route = useRoute();
const router = useRouter();

const balance = ref<number | null>(null);
const isLoadingBalance = ref(false);
const isProcessingPayment = ref(false);
const paymentSuccessDetails = ref<{ credits: number; txId: string } | null>(null);
const paymentCancelMessage = ref(false);
const errorMessage = ref('');
const activePlanLoading = ref('');

const plans = [
  {
    name: 'Starter',
    credits: 5,
    price: '2.70',
    description: 'Perfecto para postulaciones rápidas y optimizaciones puntuales.',
    features: ['5 Créditos de IA', 'Válido por 12 meses', 'Diseños ATS optimizados', 'Soporte estándar'],
    icon: Sparkle,
    color: 'var(--color-text-secondary)',
    popular: false
  },
  {
    name: 'Pro',
    credits: 15,
    price: '6.80',
    description: 'El plan más popular para profesionales activos en búsqueda de empleo.',
    features: ['15 Créditos de IA', 'Sin fecha de vencimiento', 'Diseños ATS optimizados', 'Soporte prioritario', 'Acceso a nuevas plantillas'],
    icon: Sparkles,
    color: 'var(--color-primary)',
    popular: true
  },
  {
    name: 'Max',
    credits: 35,
    price: '13.60',
    description: 'Para perfiles altamente competitivos que aplican a múltiples vacantes.',
    features: ['35 Créditos de IA', 'Sin fecha de vencimiento', 'Prioridad de procesamiento', 'Soporte 24/7 VIP', 'Acceso a nuevas plantillas', 'Sugerencias personalizadas'],
    icon: Award,
    color: 'var(--color-accent)',
    popular: false
  }
];

async function fetchBalance() {
  isLoadingBalance.value = true;
  errorMessage.value = '';
  try {
    const res = await paymentService.getBalance();
    balance.value = res.balance;
  } catch (err) {
    console.error('Error fetching balance:', err);
    errorMessage.value = 'No se pudo obtener el saldo de créditos.';
  } finally {
    isLoadingBalance.value = false;
  }
}

async function buyPlan(planName: string) {
  activePlanLoading.value = planName;
  errorMessage.value = '';
  
  // Set redirect urls
  const currentUrl = window.location.origin + window.location.pathname;
  const returnUrl = `${currentUrl}?tab=payments&status=success`;
  const cancelUrl = `${currentUrl}?tab=payments&status=cancel`;

  try {
    const res = await paymentService.createOrder({
      planName,
      returnUrl,
      cancelUrl
    });
    
    if (res.approvalUrl) {
      // Redirect to PayPal checkout
      window.location.href = res.approvalUrl;
    } else {
      errorMessage.value = 'No se pudo obtener el enlace de pago de PayPal.';
    }
  } catch (err) {
    console.error('Error buying plan:', err);
    errorMessage.value = 'Error al iniciar la compra del plan.';
  } finally {
    activePlanLoading.value = '';
  }
}

async function handlePaymentCallback() {
  const status = route.query.status as string;
  const token = route.query.token as string; // PayPal orderId

  if (status === 'success' && token) {
    isProcessingPayment.value = true;
    errorMessage.value = '';
    try {
      const res = await paymentService.captureOrder(token);
      if (res.success) {
        paymentSuccessDetails.value = {
          credits: res.creditsAdded,
          txId: res.transactionId
        };
        balance.value = res.newBalance;
      } else {
        errorMessage.value = 'El pago fue procesado pero no pudimos acreditar los saldos. Contacta a soporte.';
      }
    } catch (err) {
      console.error('Error capturing order:', err);
      errorMessage.value = 'Error al confirmar la transacción con PayPal.';
    } finally {
      isProcessingPayment.value = false;
      // Clean query parameters from URL
      router.replace({ query: { ...route.query, status: undefined, token: undefined } });
    }
  } else if (status === 'cancel') {
    paymentCancelMessage.value = true;
    // Clean query parameters
    router.replace({ query: { ...route.query, status: undefined, token: undefined } });
    setTimeout(() => {
      paymentCancelMessage.value = false;
    }, 4000);
  }
}

onMounted(() => {
  fetchBalance();
  handlePaymentCallback();
});
</script>

<template>
  <div class="payments-settings animate-fade-in">
    <!-- Success Capture Overlay Dialog -->
    <div v-if="isProcessingPayment" class="overlay-modal">
      <div class="modal-content text-center">
        <Loader2 class="spinner-loader text-primary" :size="48" />
        <h4>Confirmando Pago en PayPal</h4>
        <p>Estamos consolidando tu orden y acreditando tus saldos de IA. Por favor, no cierres esta ventana...</p>
      </div>
    </div>

    <!-- Feedback alerts -->
    <Transition name="slide-down">
      <div v-if="paymentSuccessDetails" class="toast success-toast" @click="paymentSuccessDetails = null">
        <CheckCircle2 :size="18" />
        <div>
          <span>¡Créditos acreditados! +{{ paymentSuccessDetails.credits }} créditos agregados.</span>
          <small class="toast-sub">Transacción: {{ paymentSuccessDetails.txId }}</small>
        </div>
      </div>
    </Transition>
    <Transition name="slide-down">
      <div v-if="paymentCancelMessage" class="toast error-toast">
        <AlertCircle :size="18" />
        <span>Compra cancelada. No se realizó ningún cargo en PayPal.</span>
      </div>
    </Transition>
    <Transition name="slide-down">
      <div v-if="errorMessage" class="toast error-toast">
        <AlertCircle :size="18" />
        <span>{{ errorMessage }}</span>
      </div>
    </Transition>

    <!-- Header Balance Box -->
    <div class="glass-card balance-header-card">
      <div class="balance-left">
        <span class="balance-label">Créditos de IA Disponibles</span>
        <div class="balance-row">
          <span v-if="balance !== null" class="balance-val">{{ balance }}</span>
          <span v-else class="balance-val">--</span>
          <span class="balance-unit">Crédito(s)</span>
        </div>
        <p class="balance-hint">Cada optimización o generación de CV por Inteligencia Artificial consume 1 crédito.</p>
      </div>
      <button type="button" class="btn-refresh" :disabled="isLoadingBalance" @click="fetchBalance">
        <RefreshCw :class="{ 'spinner-loader': isLoadingBalance }" :size="16" />
        <span>Actualizar saldo</span>
      </button>
    </div>

    <!-- Plans Section Title -->
    <h3 class="plans-title-header">Planes de Créditos de IA</h3>
    <p class="plans-subtitle-header">Elige el paquete que mejor se adapte a tus necesidades de postulación laboral. Los pagos se procesan de forma 100% segura mediante **PayPal**.</p>

    <!-- Grid of Plans -->
    <div class="plans-grid">
      <div 
        v-for="plan in plans" 
        :key="plan.name" 
        class="plan-card"
        :class="{ 'popular-card': plan.popular }"
      >
        <span v-if="plan.popular" class="popular-tag">Más Recomendado</span>
        
        <div class="plan-header">
          <div class="plan-icon-wrap" :style="{ color: plan.color, backgroundColor: plan.color + '10' }">
            <component :is="plan.icon" :size="24" />
          </div>
          <h4 class="plan-name">{{ plan.name }}</h4>
          <p class="plan-desc">{{ plan.description }}</p>
        </div>

        <div class="plan-price-row">
          <span class="price-currency">$</span>
          <span class="price-amount">{{ plan.price }}</span>
          <span class="price-suffix">USD</span>
        </div>
        <span class="plan-credits-sub">{{ plan.credits }} Créditos de IA</span>

        <ul class="plan-features-list">
          <li v-for="feat in plan.features" :key="feat">
            <Check :size="14" class="text-success" />
            <span>{{ feat }}</span>
          </li>
        </ul>

        <button 
          type="button" 
          class="btn-buy-plan"
          :class="{ 'btn-popular': plan.popular }"
          :disabled="activePlanLoading !== ''"
          @click="buyPlan(plan.name)"
        >
          <Loader2 v-if="activePlanLoading === plan.name" class="spinner-loader" :size="16" />
          <CreditCard v-else :size="16" />
          <span>{{ activePlanLoading === plan.name ? 'Conectando...' : 'Comprar con PayPal' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payments-settings {
  width: 100%;
}

.plans-title-header {
  font-size: 16px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  margin: var(--space-3) 0 4px 0;
}

.plans-subtitle-header {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin: 0 0 20px 0;
  max-width: 700px;
}

/* Glass Card */
.glass-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-3);
  box-shadow: var(--shadow-card);
}

/* Balance Card */
.balance-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid var(--color-accent);
  background: linear-gradient(90deg, rgba(45, 58, 199, 0.03), transparent);
}

@media (max-width: 576px) {
  .balance-header-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

.balance-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.balance-label {
  font-size: 12px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
}

.balance-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.balance-val {
  font-size: 32px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.balance-unit {
  font-size: 14px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
}

.balance-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  margin: 0;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 10px 18px;
  border-radius: var(--radius-button);
  font-size: 13px;
  font-weight: var(--fw-semibold);
  font-family: var(--font-family);
  cursor: pointer;
  transition: var(--transition);
}

.btn-refresh:hover {
  background: var(--color-bg);
}

/* Plans Grid */
.plans-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-3);
  align-items: stretch;
}

@media (max-width: 900px) {
  .plans-grid {
    grid-template-columns: 1fr;
    max-width: 420px;
    margin: 0 auto;
  }
}

.plan-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-3);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: var(--transition);
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(30, 43, 170, 0.08);
}

.popular-card {
  border: 2px solid var(--color-primary);
  box-shadow: 0 8px 24px rgba(30, 43, 170, 0.12);
}

.popular-tag {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: #fff;
  font-size: 10px;
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  padding: 4px 14px;
  border-radius: 20px;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 10px rgba(30, 43, 170, 0.25);
}

.plan-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: var(--space-2);
}

.plan-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.plan-name {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.plan-desc {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  height: 50px;
}

.plan-price-row {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 2px;
}

.price-currency {
  font-size: 16px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.price-amount {
  font-size: 36px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.price-suffix {
  font-size: 12px;
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
}

.plan-credits-sub {
  display: block;
  text-align: center;
  font-size: 13px;
  font-weight: var(--fw-bold);
  color: var(--color-accent);
  margin-bottom: var(--space-2);
}

.plan-features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-3) 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.plan-features-list li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.btn-buy-plan {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  border-radius: var(--radius-button);
  font-size: 13px;
  font-weight: var(--fw-bold);
  font-family: var(--font-family);
  cursor: pointer;
  transition: var(--transition);
}

.btn-buy-plan:hover {
  background: var(--color-border);
}

.btn-popular {
  background: var(--color-primary) !important;
  color: #fff !important;
  border: none !important;
}

.btn-popular:hover {
  background: var(--color-primary-dark) !important;
  box-shadow: 0 4px 12px rgba(30, 43, 170, 0.25);
}

.btn-buy-plan:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner Rotate Animation */
.spinner-loader {
  animation: spinnerRotate 0.8s infinite linear;
}

@keyframes spinnerRotate {
  to { transform: rotate(360deg); }
}

/* Overlay Modal for capture status */
.overlay-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 26, 0.6);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-4) var(--space-3);
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.modal-content h4 {
  margin: 0;
  font-size: 18px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.modal-content p {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.45;
  text-align: center;
}

/* Toast alerts styling */
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: var(--fw-bold);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  cursor: pointer;
}

.success-toast {
  background: rgba(59, 156, 32, 0.95);
  color: #fff;
  border: 1px solid rgba(59, 156, 32, 0.2);
}

.toast-sub {
  display: block;
  font-size: 11px;
  font-weight: var(--fw-medium);
  opacity: 0.8;
  margin-top: 2px;
}

.error-toast {
  background: rgba(210, 38, 38, 0.95);
  color: #fff;
  border: 1px solid rgba(210, 38, 38, 0.2);
}

.text-success {
  color: var(--color-state-success);
}

.text-primary {
  color: var(--color-primary);
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
