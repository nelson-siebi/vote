const NelsiusPay = require('nelsius-pay');

// Service de paiement Nelsius
class PaymentService {
  constructor() {
    this.client = null;
    
    // Mode Réel Forcé : On initialise toujours le SDK avec la clé présente dans .env
    const apiKey = process.env.NELSIUS_API_KEY || '';
    
    try {
      this.client = new NelsiusPay(apiKey);
      console.log('✅ NelsiusPay SDK initialisé (Mode Réel)');
    } catch (err) {
      console.error('❌ Erreur initialisation NelsiusPay SDK:', err.message);
    }
  }

  /**
   * Récupère le client NelsiusPay avec la clé la plus récente (DB ou ENV)
   */
  async getClient() {
    const db = require('../db');
    try {
      const [[settings]] = await db.query('SELECT nelsius_api_key FROM site_settings WHERE id = 1');
      const apiKey = settings?.nelsius_api_key || process.env.NELSIUS_API_KEY || '';
      
      if (!apiKey) {
        throw new Error("Clé API NelsiusPay manquante (Base de données et .env vides).");
      }
      
      return new NelsiusPay(apiKey);
    } catch (err) {
      console.error('❌ Erreur lors de la récupération de la clé API:', err.message);
      throw err;
    }
  }

  /**
   * Initie un paiement DirectPay
   */
  async directCharge({ amount, currency = 'XAF', phone, operator, description, reference, callbackUrl, metadata }) {
    const client = await this.getClient();

    try {
      console.log(`[PAYMENT] Init charge: ${amount} ${currency} for ${phone} (${operator})`);
      console.log(`[PAYMENT] Ref: ${reference}, Callback: ${callbackUrl}`);

      // Utilisation du SDK NelsiusPay
      const response = await client.charges.create({
        amount,
        currency,
        method: 'mobile_money',
        operator: operator.toLowerCase(),
        customer_phone: phone,
        reference,
        callback_url: callbackUrl,
        metadata
      });

      console.log('[PAYMENT] SDK Response:', JSON.stringify(response, null, 2));

      return {
        success: response.status === 'success' || response.status === 'pending',
        transactionId: response.data ? (response.data.charge_id || response.data.id) : null,
        message: response.message || 'Demande envoyée au téléphone',
        data: response
      };
    } catch (err) {
      console.error('❌ Erreur NelsiusPay DirectCharge:', err.response ? JSON.stringify(err.response.data) : err.message);
      throw err;
    }
  }

  /**
   * Vérifie le statut d'un paiement auprès de NelsiusPay
   */
  async checkStatus(chargeId) {
    try {
      const client = await this.getClient();
      console.log(`[PAYMENT] Checking status for: ${chargeId}`);
      const response = await client.charges.retrieve(chargeId);
      console.log(`[PAYMENT] Status response:`, response.status);
      return response;
    } catch (err) {
      console.error('❌ Erreur CheckStatus:', err.message);
      return { status: 'error' };
    }
  }
}

module.exports = new PaymentService();
