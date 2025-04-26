import { Router } from 'express';
import { vendorApiService } from '../services/vendorApiService';

const router = Router();

/**
 * @route GET /api/vendor-api/settings
 * @desc Get current vendor API settings (excluding secrets)
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await vendorApiService.getSettings();
    
    // Response with API keys but mask the secrets
    const response = {
      larsonApiKey: settings.larsonApiKey || '',
      larsonApiSecret: settings.larsonApiSecret ? true : false,
      larsonStatus: settings.larsonApiKey ? 'connected' : 'not_configured',
      
      romaApiKey: settings.romaApiKey || '',
      romaApiSecret: settings.romaApiSecret ? true : false,
      romaStatus: settings.romaApiKey ? 'connected' : 'not_configured',
      
      bellaApiKey: settings.bellaApiKey || '',
      bellaApiSecret: settings.bellaApiSecret ? true : false,
      bellaStatus: settings.bellaApiKey ? 'connected' : 'not_configured',
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching vendor API settings:', error);
    res.status(500).json({ 
      message: 'Error fetching vendor API settings', 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/vendor-api/settings
 * @desc Update vendor API settings
 */
router.post('/settings', async (req, res) => {
  try {
    const { 
      larsonApiKey, larsonApiSecret,
      romaApiKey, romaApiSecret,
      bellaApiKey, bellaApiSecret 
    } = req.body;
    
    // Only update the settings that are provided
    const updatedSettings: Record<string, string> = {};
    
    if (larsonApiKey !== undefined) {
      updatedSettings.larsonApiKey = larsonApiKey;
    }
    
    if (larsonApiSecret !== undefined) {
      updatedSettings.larsonApiSecret = larsonApiSecret;
    }
    
    if (romaApiKey !== undefined) {
      updatedSettings.romaApiKey = romaApiKey;
    }
    
    if (romaApiSecret !== undefined) {
      updatedSettings.romaApiSecret = romaApiSecret;
    }
    
    if (bellaApiKey !== undefined) {
      updatedSettings.bellaApiKey = bellaApiKey;
    }
    
    if (bellaApiSecret !== undefined) {
      updatedSettings.bellaApiSecret = bellaApiSecret;
    }
    
    // Save the updated settings
    await vendorApiService.updateSettings(updatedSettings);
    
    // Get the current settings for response
    const currentSettings = await vendorApiService.getSettings();
    
    // Prepare response
    const response = {
      message: 'Settings updated successfully',
      larsonStatus: currentSettings.larsonApiKey ? 'connected' : 'not_configured',
      romaStatus: currentSettings.romaApiKey ? 'connected' : 'not_configured',
      bellaStatus: currentSettings.bellaApiKey ? 'connected' : 'not_configured',
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating vendor API settings:', error);
    res.status(500).json({ 
      message: 'Error updating vendor API settings', 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/vendor-api/test-connection/:vendor
 * @desc Test connection to specific vendor API
 */
router.post('/test-connection/:vendor', async (req, res) => {
  try {
    const { vendor } = req.params;
    
    let result = { success: false, message: 'Invalid vendor specified' };
    
    switch (vendor.toLowerCase()) {
      case 'larson':
        result = await vendorApiService.testLarsonConnection();
        break;
      case 'roma':
        result = await vendorApiService.testRomaConnection();
        break;
      case 'bella':
        result = await vendorApiService.testBellaConnection();
        break;
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error testing ${req.params.vendor} API connection:`, error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to test API connection: ${error.message}` 
    });
  }
});

export default router;