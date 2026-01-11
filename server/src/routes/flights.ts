import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get flight status from aviationstack API
router.get('/status/:flightNumber', async (req, res) => {
  try {
    const { flightNumber } = req.params;
    const apiKey = process.env.AVIATIONSTACK_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'AviationStack API key not configured',
        message: 'Please set AVIATIONSTACK_API_KEY in your environment variables'
      });
    }

    // Parse flight number (e.g., "AA123" -> "AA" and "123")
    const airlineMatch = flightNumber.match(/^([A-Z]+)(\d+)$/);
    if (!airlineMatch) {
      return res.status(400).json({ error: 'Invalid flight number format' });
    }

    const [, airlineCode, flightNum] = airlineMatch;

    try {
      const response = await axios.get('http://api.aviationstack.com/v1/flights', {
        params: {
          access_key: apiKey,
          flight_iata: flightNumber,
          limit: 1
        }
      });

      if (response.data.data && response.data.data.length > 0) {
        const flight = response.data.data[0];
        res.json({
          flightNumber,
          status: flight.flight_status || 'Unknown',
          departure: {
            airport: flight.departure?.airport || 'Unknown',
            scheduled: flight.departure?.scheduled || null,
            actual: flight.departure?.actual || null,
            delay: flight.departure?.delay || null
          },
          arrival: {
            airport: flight.arrival?.airport || 'Unknown',
            scheduled: flight.arrival?.scheduled || null,
            actual: flight.arrival?.actual || null,
            delay: flight.arrival?.delay || null
          },
          airline: flight.airline?.name || 'Unknown'
        });
      } else {
        res.json({
          flightNumber,
          status: 'Not found',
          message: 'Flight information not available'
        });
      }
    } catch (apiError: any) {
      console.error('AviationStack API error:', apiError.response?.data || apiError.message);
      res.status(500).json({
        error: 'Failed to fetch flight status',
        message: apiError.response?.data?.error?.info || 'API request failed'
      });
    }
  } catch (error) {
    console.error('Error fetching flight status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;