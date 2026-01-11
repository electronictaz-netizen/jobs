import axios from 'axios';
import { query, run } from '../database';

const API_KEY = process.env.AVIATIONSTACK_API_KEY;

interface FlightStatusData {
  flightNumber: string;
  status: string;
  departure: {
    airport: string;
    scheduled: string | null;
    actual: string | null;
    delay: number | null;
  };
  arrival: {
    airport: string;
    scheduled: string | null;
    actual: string | null;
    delay: number | null;
  };
  airline: string;
}

/**
 * Fetches flight status from AviationStack API
 */
async function fetchFlightStatus(flightNumber: string): Promise<FlightStatusData | null> {
  if (!API_KEY) {
    console.error('AviationStack API key not configured');
    return null;
  }

  try {
    const response = await axios.get('http://api.aviationstack.com/v1/flights', {
      params: {
        access_key: API_KEY,
        flight_iata: flightNumber,
        limit: 1
      }
    });

    if (response.data.data && response.data.data.length > 0) {
      const flight = response.data.data[0];
      return {
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
      };
    }
  } catch (error: any) {
    console.error(`Error fetching flight status for ${flightNumber}:`, error.response?.data || error.message);
  }

  return null;
}

/**
 * Updates flight status for all jobs with upcoming or recent flights
 */
export async function updateFlightStatuses(): Promise<void> {
  if (!API_KEY) {
    console.log('AviationStack API key not configured, skipping flight status update');
    return;
  }

  try {
    // Get all jobs with flight numbers that are not too old (within last 7 days and future)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const jobs = await query(
      `SELECT DISTINCT flightNumber FROM jobs 
       WHERE pickupDate >= ? AND flightNumber IS NOT NULL AND flightNumber != '' 
       ORDER BY pickupDate DESC`,
      [cutoffDateStr]
    );

    console.log(`Updating flight status for ${jobs.length} unique flights...`);

    // Update status for each unique flight number
    for (const job of jobs) {
      const flightNumber = job.flightNumber;
      if (!flightNumber) continue;

      try {
        const flightStatus = await fetchFlightStatus(flightNumber);
        
        if (flightStatus) {
          const statusData = JSON.stringify(flightStatus);
          const now = new Date().toISOString();

          // Update all jobs with this flight number
          await run(
            `UPDATE jobs 
             SET flightStatus = ?, 
                 flightStatusData = ?, 
                 flightStatusUpdatedAt = ? 
             WHERE flightNumber = ?`,
            [flightStatus.status, statusData, now, flightNumber]
          );

          console.log(`Updated flight status for ${flightNumber}: ${flightStatus.status}`);
        } else {
          // Mark as not found
          await run(
            `UPDATE jobs 
             SET flightStatus = 'Not found', 
                 flightStatusUpdatedAt = ? 
             WHERE flightNumber = ? AND flightStatus IS NULL`,
            [new Date().toISOString(), flightNumber]
          );
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`Error updating flight status for ${flightNumber}:`, error.message);
      }
    }

    console.log('Flight status update completed');
  } catch (error) {
    console.error('Error in flight status update job:', error);
  }
}
