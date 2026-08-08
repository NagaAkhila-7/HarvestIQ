const express = require('express');
const router = express.Router();
const seedDatabase = require('../seed/seed');

const handleSeedRequest = async (req, res) => {
  try {
    const providedSecret = req.headers['x-seed-secret'] || req.query.secret || (req.body && req.body.secret);
    const expectedSecret = process.env.PRODUCTION_SEED_SECRET;

    if (!expectedSecret || providedSecret !== expectedSecret) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Invalid or missing seed secret. Production seeding is unauthorized.'
        }
      });
    }

    console.log('[Production Seed Endpoint] Authorized seed request received. Seeding database...');
    const summary = await seedDatabase({ isStandalone: false });

    return res.json({
      success: true,
      message: 'HarvestIQ production database seeded successfully!',
      summary,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('[Production Seed Endpoint Error]', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SEED_FAILED',
        message: error.message || 'Failed to seed production database.'
      }
    });
  }
};

router.get('/', handleSeedRequest);
router.post('/', handleSeedRequest);

module.exports = router;
