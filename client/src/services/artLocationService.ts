import { apiRequest } from "@/lib/queryClient";
import { notificationService } from "@/lib/notificationService";

interface ArtLocationData {
  orderId: number;
  artworkDescription: string;
  artworkType: string;
  artworkLocation: string;
  artworkImage?: string;
  artworkWidth: number;
  artworkHeight: number;
}

/**
 * Art Location Service
 * Handles sending artwork location data to the Art Locations app
 */
export const artLocationService = {
  /**
   * Sends artwork location data to the Art Locations app
   * @param data Artwork location data
   * @returns Promise with the response
   */
  async sendArtLocationData(data: ArtLocationData): Promise<any> {
    try {
      // Send data to our internal API endpoint that communicates with the Art Locations app
      const response = await apiRequest('POST', '/api/art-locations', data);
      
      // Notify about successful sync
      notificationService.sendNotification({
        title: 'Art Location Synced',
        description: `Artwork location for order #${data.orderId} has been synced with Art Locations app`,
        type: 'success',
        source: 'POS',
        sourceId: data.orderId.toString()
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error sending art location data:', error);
      
      // Notify about sync failure
      notificationService.sendNotification({
        title: 'Art Location Sync Failed',
        description: `Failed to sync artwork location for order #${data.orderId} with Art Locations app`,
        type: 'error',
        source: 'POS',
        sourceId: data.orderId.toString()
      });
      
      throw error;
    }
  }
};